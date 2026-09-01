import "dotenv/config";
import dns from "dns";
import express from "express";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getCategoryImage } from "./src/utils/categoryImages.ts";
import { BANGLADESH_DISTRICTS } from "./src/constants/districts.ts";

// Prefer IPv4. Do not override DNS servers — that can resolve Atlas to
// unreachable IPs on some ISP/Mac setups and cause ECONNREFUSED.
dns.setDefaultResultOrder("ipv4first");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://sdp:sdpsdp@cluster0.9fctwv1.mongodb.net/?appName=Cluster0";
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key_for_dev_only";
const PORT = Number(process.env.PORT) || 3000;

if (!process.env.NODE_ENV && process.env.PORT) {
  process.env.NODE_ENV = "production";
}

function connectDatabase() {
  mongoose.connect(MONGODB_URI, {
    family: 4,
    serverSelectionTimeoutMS: 10000,
  }).then(() => {
    console.log("Connected to MongoDB");
  }).catch((error: any) => {
    console.error("MongoDB connection error:", error.message || error);
  });
}

// -------------------------------------------------------------
// Models
// -------------------------------------------------------------
const EVENT_CATEGORIES = ['Workshop', 'Meetup', 'Conference', 'Concert', 'Sports', 'Networking', 'Other'];

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'organizer'], default: 'user' },
  bio: { type: String, default: '' },
  website: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  bkashNumber: { type: String, default: '' },
});

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  district: { type: String, enum: BANGLADESH_DISTRICTS, default: 'Dhaka' },
  category: { type: String, enum: EVENT_CATEGORIES, default: 'Other' },
  imageUrl: { type: String, default: '' },
  capacity: { type: Number, default: null },
  isPaid: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const PaymentRequestSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transactionId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  ticketCode: { type: String, default: '' },
}, { timestamps: true });

PaymentRequestSchema.index({ event: 1, user: 1 });
PaymentRequestSchema.index({ event: 1, transactionId: 1 }, { unique: true });

const SavedEventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
}, { timestamps: true });

SavedEventSchema.index({ user: 1, event: 1 }, { unique: true });

const User = mongoose.model('User', UserSchema);
const Event = mongoose.model('Event', EventSchema);
const PaymentRequest = mongoose.model('PaymentRequest', PaymentRequestSchema);
const SavedEvent = mongoose.model('SavedEvent', SavedEventSchema);

async function startServer() {
  const app = express();

  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      env: process.env.NODE_ENV || "development",
      port: PORT,
      db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
  });

  connectDatabase();

  // -------------------------------------------------------------
  // Middleware
  // -------------------------------------------------------------
  const auth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string };
      (req as any).user = decoded;
      next();
    } catch (ex) {
      res.status(400).json({ error: 'Invalid token.' });
    }
  };

  const requireOrganizer = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if ((req as any).user.role !== 'organizer') {
      return res.status(403).json({ error: 'Organizer access only.' });
    }
    next();
  };

  const optionalAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return next();
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
      (req as any).user = decoded;
    } catch {
      // ignore invalid token for public browse
    }
    next();
  };

  const getEventDateTime = (event: { date: Date | string; time: string }) => {
    const dateStr = typeof event.date === 'string'
      ? event.date.split('T')[0]
      : event.date.toISOString().split('T')[0];
    return new Date(`${dateStr}T${event.time}`);
  };

  const isEventPast = (event: { date: Date | string; time: string }) => {
    const eventDate = getEventDateTime(event);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    return eventDay < today;
  };

  // -------------------------------------------------------------
  // API Routes
  // -------------------------------------------------------------
  
  const organizerFields = 'name email role bio website linkedin bkashNumber';

  const generateTicketCode = (eventId: string) =>
    `EH-${eventId.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  // Auth Routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ error: 'Email already registered.' });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({ name, email, password: hashedPassword, role: role || 'user' });
      await user.save();

      const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ error: 'Invalid email or password.' });

      const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/auth/me', auth, async (req, res) => {
    try {
      const user = await User.findById((req as any).user.userId).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ user });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Event Routes
  app.get('/api/events', optionalAuth, async (req, res) => {
    try {
      const { search, category, priceType, sort } = req.query;
      const query: Record<string, unknown> = {};
      if (search) {
        query.name = { $regex: search as string, $options: 'i' };
      }
      if (category && category !== 'all') {
        query.category = category;
      }
      if (priceType === 'free') {
        query.$or = [{ isPaid: false }, { price: { $lte: 0 } }];
      } else if (priceType === 'paid') {
        query.isPaid = true;
        query.price = { $gt: 0 };
      }

      let sortOption: Record<string, 1 | -1> = { date: 1 };
      if (sort === 'price-asc') sortOption = { price: 1, date: 1 };
      if (sort === 'price-desc') sortOption = { price: -1, date: 1 };
      if (sort === 'newest') sortOption = { createdAt: -1 };

      const events = await Event.find(query).populate('organizer', organizerFields).sort(sortOption);

      if ((req as any).user) {
        const userId = (req as any).user.userId;
        const eventIds = events.map((e) => e._id);
        const [payments, saved] = await Promise.all([
          PaymentRequest.find({ user: userId, event: { $in: eventIds } }).sort({ updatedAt: -1 }),
          SavedEvent.find({ user: userId, event: { $in: eventIds } }),
        ]);
        const savedSet = new Set(saved.map((s) => s.event.toString()));
        const paymentByEvent = new Map<string, any>();
        for (const p of payments) {
          const key = p.event.toString();
          if (!paymentByEvent.has(key)) paymentByEvent.set(key, p);
        }

        const enriched = events.map((event) => {
          const obj = event.toObject();
          const eid = event._id.toString();
          let registrationStatus = 'none';
          if (event.attendees.some((id) => id.toString() === userId)) {
            registrationStatus = 'approved';
          } else if (paymentByEvent.has(eid)) {
            registrationStatus = paymentByEvent.get(eid).status;
          }
          return {
            ...obj,
            registrationStatus,
            isSaved: savedSet.has(eid),
          };
        });
        return res.json(enriched);
      }

      res.json(events);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/events/:id', optionalAuth, async (req, res) => {
    try {
      const event = await Event.findById(req.params.id)
        .populate('organizer', organizerFields)
        .populate('attendees', 'name email');
      if (!event) return res.status(404).json({ error: 'Event not found' });

      const payload: any = event.toObject();
      const user = (req as any).user;
      if (user?.userId) {
        const saved = await SavedEvent.findOne({ user: user.userId, event: event._id });
        payload.isSaved = !!saved;
      }

      res.json(payload);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/events', auth, async (req, res) => {
    try {
      const { role, userId } = (req as any).user;
      if (role !== 'organizer') return res.status(403).json({ error: 'Only organizers can create events.' });

      const { name, description, date, time, location, district, category, imageUrl, capacity, isPaid, price } = req.body;
      if (!district || !BANGLADESH_DISTRICTS.includes(district)) {
        return res.status(400).json({ error: 'A valid district is required.' });
      }
      const eventCategory = category || 'Other';
      const finalImageUrl = imageUrl?.trim()
        || getCategoryImage(eventCategory, `${name}-${date}-${userId}`);

      const paid = Boolean(isPaid);
      const eventPrice = paid ? Number(price) : 0;
      if (paid && (!eventPrice || eventPrice <= 0)) {
        return res.status(400).json({ error: 'Paid events must have a price greater than 0.' });
      }
      if (paid) {
        const organizer = await User.findById(userId);
        if (!organizer?.bkashNumber?.trim()) {
          return res.status(400).json({ error: 'Add your bKash number in Profile before creating paid events.' });
        }
      }

      const event = new Event({
        name,
        description,
        date,
        time,
        location,
        district,
        category: eventCategory,
        imageUrl: finalImageUrl,
        capacity: capacity ? Number(capacity) : null,
        isPaid: paid,
        price: eventPrice,
        organizer: userId,
      });
      await event.save();
      res.status(201).json(event);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/events/:id', auth, async (req, res) => {
    try {
      const { userId, role } = (req as any).user;
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ error: 'Event not found' });

      if (event.organizer.toString() !== userId && role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized to edit this event.' });
      }

      const { name, description, date, time, location, district, category, imageUrl, capacity, isPaid, price } = req.body;
      if (!district || !BANGLADESH_DISTRICTS.includes(district)) {
        return res.status(400).json({ error: 'A valid district is required.' });
      }
      event.name = name || event.name;
      event.description = description || event.description;
      event.date = date || event.date;
      event.time = time || event.time;
      event.location = location || event.location;
      event.district = district;
      if (category) event.category = category;
      if (imageUrl !== undefined) {
        event.imageUrl = imageUrl.trim()
          || getCategoryImage(event.category, event._id.toString());
      } else if (!event.imageUrl?.trim()) {
        event.imageUrl = getCategoryImage(event.category, event._id.toString());
      }
      if (capacity !== undefined) event.capacity = capacity ? Number(capacity) : null;
      if (isPaid !== undefined) event.isPaid = Boolean(isPaid);
      if (price !== undefined) event.price = event.isPaid ? Number(price) : 0;
      if (event.isPaid && event.price <= 0) {
        return res.status(400).json({ error: 'Paid events must have a price greater than 0.' });
      }
      if (event.isPaid) {
        const organizer = await User.findById(userId);
        if (!organizer?.bkashNumber?.trim()) {
          return res.status(400).json({ error: 'Add your bKash number in Profile before saving paid events.' });
        }
      }

      await event.save();
      res.json(event);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/events/:id', auth, async (req, res) => {
    try {
      const { userId, role } = (req as any).user;
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ error: 'Event not found' });

      if (event.organizer.toString() !== userId && role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized to delete this event.' });
      }

      await event.deleteOne();
      res.json({ message: 'Event deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Registration Routes
  app.get('/api/events/:id/registration-status', auth, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ error: 'Event not found' });

      const isRegistered = event.attendees.some((id) => id.toString() === userId);
      if (isRegistered) {
        const payment = await PaymentRequest.findOne({ event: event._id, user: userId, status: 'approved' });
        return res.json({
          status: 'approved',
          payment: payment ? {
            transactionId: payment.transactionId,
            amount: payment.amount,
            ticketCode: payment.ticketCode,
          } : null,
        });
      }

      const pending = await PaymentRequest.findOne({ event: event._id, user: userId, status: 'pending' });
      if (pending) {
        return res.json({
          status: 'pending',
          payment: {
            transactionId: pending.transactionId,
            amount: pending.amount,
          },
        });
      }

      const rejected = await PaymentRequest.findOne({ event: event._id, user: userId, status: 'rejected' })
        .sort({ updatedAt: -1 });
      if (rejected) {
        return res.json({ status: 'rejected' });
      }

      res.json({ status: 'none' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/events/:id/register', auth, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const event = await Event.findById(req.params.id).populate('organizer', organizerFields);
      if (!event) return res.status(404).json({ error: 'Event not found' });

      if (event.attendees.some((id) => id.toString() === userId)) {
        return res.status(400).json({ error: 'Already registered for this event.' });
      }

      if (event.capacity && event.capacity > 0 && event.attendees.length >= event.capacity) {
        return res.status(400).json({ error: 'Event is full. No more spots available.' });
      }

      if (event.isPaid && event.price > 0) {
        const { transactionId } = req.body;
        if (!transactionId?.trim()) {
          return res.status(400).json({ error: 'Transaction ID is required for paid events.' });
        }

        const organizer = event.organizer as any;
        if (!organizer?.bkashNumber?.trim()) {
          return res.status(400).json({ error: 'Organizer has not set a bKash number yet.' });
        }

        const existingTx = await PaymentRequest.findOne({
          event: event._id,
          transactionId: transactionId.trim(),
        });
        if (existingTx) {
          return res.status(400).json({ error: 'This transaction ID has already been submitted.' });
        }

        const existingPending = await PaymentRequest.findOne({
          event: event._id,
          user: userId,
          status: 'pending',
        });
        if (existingPending) {
          return res.status(400).json({ error: 'You already have a pending payment for this event.' });
        }

        const payment = new PaymentRequest({
          event: event._id,
          user: userId,
          transactionId: transactionId.trim(),
          amount: event.price,
          status: 'pending',
        });
        await payment.save();

        return res.status(201).json({
          message: 'Payment submitted. Waiting for organizer approval.',
          status: 'pending',
        });
      }

      event.attendees.push(userId);
      await event.save();
      res.json({ message: 'Successfully registered for event.', status: 'approved' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/events/:id/register', auth, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const event = await Event.findById(req.params.id);
      if (!event) return res.status(404).json({ error: 'Event not found' });

      const wasRegistered = event.attendees.some((id) => id.toString() === userId);
      event.attendees = event.attendees.filter((id) => id.toString() !== userId);
      await event.save();

      await PaymentRequest.deleteMany({
        event: event._id,
        user: userId,
        status: { $in: ['pending', 'approved'] },
      });

      res.json({
        message: wasRegistered
          ? 'Successfully canceled registration.'
          : 'Pending payment canceled.',
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/organizer/payments', auth, requireOrganizer, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const status = ((req.query.status as string) || 'pending') as 'pending' | 'approved' | 'rejected';

      const myEvents = await Event.find({ organizer: userId }).select('_id');
      const eventIds = myEvents.map((e) => e._id);

      const payments = await PaymentRequest.find({
        event: { $in: eventIds },
        status,
      })
        .populate('user', 'name email')
        .populate('event', 'name date time price')
        .sort({ createdAt: -1 });

      res.json(payments);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/organizer/payments/:id/approve', auth, requireOrganizer, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const payment = await PaymentRequest.findById(req.params.id)
        .populate('event')
        .populate('user', 'name email');

      if (!payment) return res.status(404).json({ error: 'Payment request not found.' });
      const event = payment.event as any;
      if (event.organizer.toString() !== userId) {
        return res.status(403).json({ error: 'Unauthorized.' });
      }
      if (payment.status !== 'pending') {
        return res.status(400).json({ error: 'This payment has already been processed.' });
      }
      if (event.capacity && event.capacity > 0 && event.attendees.length >= event.capacity) {
        return res.status(400).json({ error: 'Event is full. Cannot approve more attendees.' });
      }

      const attendeeId = payment.user._id.toString();
      if (!event.attendees.some((id: any) => id.toString() === attendeeId)) {
        event.attendees.push(payment.user._id);
        await event.save();
      }

      payment.status = 'approved';
      payment.ticketCode = generateTicketCode(event._id.toString());
      await payment.save();

      res.json({ message: 'Payment approved. Ticket issued.', payment });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/organizer/payments/:id/reject', auth, requireOrganizer, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const payment = await PaymentRequest.findById(req.params.id).populate('event');

      if (!payment) return res.status(404).json({ error: 'Payment request not found.' });
      const event = payment.event as any;
      if (event.organizer.toString() !== userId) {
        return res.status(403).json({ error: 'Unauthorized.' });
      }
      if (payment.status !== 'pending') {
        return res.status(400).json({ error: 'This payment has already been processed.' });
      }

      payment.status = 'rejected';
      await payment.save();

      res.json({ message: 'Payment rejected.', payment });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.get('/api/users/dashboard', auth, async (req, res) => {
      try {
        const { userId, role } = (req as any).user;
        if (role === 'organizer') {
            const myEvents = await Event.find({ organizer: userId }).populate('attendees', 'name email').sort({ date: 1 });
            res.json({ events: myEvents });
        } else {
            const registeredEvents = await Event.find({ attendees: userId }).populate('organizer', organizerFields).sort({ date: 1 });
            res.json({ events: registeredEvents });
        }
      } catch (err: any) {
          res.status(500).json({ error: err.message });
      }
  });

  app.get('/api/organizer/overview', auth, requireOrganizer, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const events = await Event.find({ organizer: userId })
        .populate('attendees', 'name email')
        .sort({ date: 1 });

      const upcomingEvents = events.filter((event) => !isEventPast(event));
      const pastEvents = events.filter((event) => isEventPast(event));
      const totalAttendees = events.reduce((sum, event) => sum + event.attendees.length, 0);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const eventsThisMonth = events.filter((event) => {
        const eventDate = getEventDateTime(event);
        return eventDate >= startOfMonth && eventDate <= endOfMonth;
      }).length;

      const recentEvents = await Event.find({ organizer: userId })
        .populate('attendees', 'name email')
        .sort({ updatedAt: -1 })
        .limit(5);

      const recentRegistrations: { attendee: { _id: string; name: string; email: string }; event: { _id: string; name: string } }[] = [];
      for (const event of recentEvents) {
        for (const attendee of event.attendees) {
          const attendeeDoc = attendee as any;
          recentRegistrations.push({
            attendee: { _id: attendeeDoc._id.toString(), name: attendeeDoc.name, email: attendeeDoc.email },
            event: { _id: event._id.toString(), name: event.name },
          });
        }
      }

      res.json({
        stats: {
          totalEvents: events.length,
          upcomingEvents: upcomingEvents.length,
          pastEvents: pastEvents.length,
          totalAttendees,
          eventsThisMonth,
        },
        upcomingEvent: upcomingEvents[0] || null,
        recentRegistrations: recentRegistrations.slice(0, 8),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/organizer/events', auth, requireOrganizer, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const status = (req.query.status as string) || 'all';

      const events = await Event.find({ organizer: userId })
        .populate('attendees', 'name email')
        .sort({ date: 1 });

      let filtered = events;
      if (status === 'upcoming') {
        filtered = events.filter((event) => !isEventPast(event));
      } else if (status === 'past') {
        filtered = events.filter((event) => isEventPast(event));
      }

      res.json(filtered);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/organizer/attendees', auth, requireOrganizer, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const search = ((req.query.search as string) || '').toLowerCase().trim();

      const events = await Event.find({ organizer: userId })
        .populate('attendees', 'name email')
        .sort({ date: -1 });

      const attendees: {
        attendee: { _id: string; name: string; email: string };
        event: { _id: string; name: string; date: string; time: string };
      }[] = [];

      for (const event of events) {
        for (const attendee of event.attendees) {
          const attendeeDoc = attendee as any;
          const entry = {
            attendee: {
              _id: attendeeDoc._id.toString(),
              name: attendeeDoc.name,
              email: attendeeDoc.email,
            },
            event: {
              _id: event._id.toString(),
              name: event.name,
              date: event.date.toISOString(),
              time: event.time,
            },
          };

          if (!search) {
            attendees.push(entry);
            continue;
          }

          const matches =
            entry.attendee.name.toLowerCase().includes(search) ||
            entry.attendee.email.toLowerCase().includes(search) ||
            entry.event.name.toLowerCase().includes(search);

          if (matches) attendees.push(entry);
        }
      }

      res.json(attendees);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/organizer/profile', auth, requireOrganizer, async (req, res) => {
    try {
      const user = await User.findById((req as any).user.userId).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ user });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/organizer/profile', auth, requireOrganizer, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const { name, bio, website, linkedin, bkashNumber } = req.body;

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      if (name) user.name = name;
      if (bio !== undefined) user.bio = bio;
      if (website !== undefined) user.website = website;
      if (linkedin !== undefined) user.linkedin = linkedin;
      if (bkashNumber !== undefined) user.bkashNumber = bkashNumber;

      await user.save();
      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          bio: user.bio,
          website: user.website,
          linkedin: user.linkedin,
          bkashNumber: user.bkashNumber,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/organizers/:id', async (req, res) => {
    try {
      const organizer = await User.findById(req.params.id).select('-password');
      if (!organizer || organizer.role !== 'organizer') {
        return res.status(404).json({ error: 'Organizer not found' });
      }

      const events = await Event.find({ organizer: organizer._id })
        .populate('organizer', organizerFields)
        .sort({ date: 1 });

      res.json({
        organizer: {
          _id: organizer._id,
          name: organizer.name,
          email: organizer.email,
          role: organizer.role,
          bio: organizer.bio,
          website: organizer.website,
          linkedin: organizer.linkedin,
        },
        events,
        eventCount: events.length,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Attendee Routes
  app.get('/api/attendee/overview', auth, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const registeredEvents = await Event.find({ attendees: userId })
        .populate('organizer', organizerFields)
        .sort({ date: 1 });

      const upcomingEvents = registeredEvents.filter((e) => !isEventPast(e));
      const pastEvents = registeredEvents.filter((e) => isEventPast(e));
      const pendingPayments = await PaymentRequest.find({ user: userId, status: 'pending' })
        .populate('event', 'name date time price isPaid')
        .sort({ createdAt: -1 });
      const approvedTickets = await PaymentRequest.countDocuments({ user: userId, status: 'approved' });
      const savedCount = await SavedEvent.countDocuments({ user: userId });
      const freeRegistered = registeredEvents.filter((e) => !e.isPaid || e.price <= 0).length;

      res.json({
        stats: {
          totalRegistered: registeredEvents.length,
          upcomingEvents: upcomingEvents.length,
          pastEvents: pastEvents.length,
          pendingPayments: pendingPayments.length,
          tickets: approvedTickets + freeRegistered,
          savedEvents: savedCount,
        },
        nextEvent: upcomingEvents[0] || null,
        pendingPayments: pendingPayments.slice(0, 6),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/attendee/schedule', auth, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const status = (req.query.status as string) || 'upcoming';

      if (status === 'pending') {
        const payments = await PaymentRequest.find({ user: userId, status: 'pending' })
          .populate({
            path: 'event',
            populate: { path: 'organizer', select: organizerFields },
          })
          .sort({ createdAt: -1 });
        return res.json(
          payments.map((p) => ({
            event: p.event,
            registrationStatus: 'pending',
            payment: {
              _id: p._id,
              transactionId: p.transactionId,
              amount: p.amount,
              createdAt: p.createdAt,
            },
          }))
        );
      }

      const events = await Event.find({ attendees: userId })
        .populate('organizer', organizerFields)
        .sort({ date: 1 });

      const filtered =
        status === 'past'
          ? events.filter((e) => isEventPast(e))
          : events.filter((e) => !isEventPast(e));

      res.json(
        filtered.map((e) => ({
          event: e,
          registrationStatus: 'approved',
        }))
      );
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/attendee/tickets', auth, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const approvedPayments = await PaymentRequest.find({ user: userId, status: 'approved' })
        .populate({ path: 'event', populate: { path: 'organizer', select: 'name email' } })
        .sort({ updatedAt: -1 });

      const registeredEvents = await Event.find({ attendees: userId })
        .populate('organizer', 'name email')
        .sort({ date: 1 });

      const paidEventIds = new Set(approvedPayments.map((p) => (p.event as any)._id.toString()));
      const tickets: any[] = [];

      for (const payment of approvedPayments) {
        tickets.push({
          event: payment.event,
          ticketCode: payment.ticketCode,
          transactionId: payment.transactionId,
          amount: payment.amount,
          type: 'paid',
        });
      }

      for (const event of registeredEvents) {
        if (!paidEventIds.has(event._id.toString())) {
          tickets.push({
            event,
            ticketCode: `FREE-${event._id.toString().slice(-6).toUpperCase()}`,
            transactionId: null,
            amount: 0,
            type: 'free',
          });
        }
      }

      tickets.sort((a, b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime());
      res.json(tickets);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/attendee/payments', auth, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const status = ((req.query.status as string) || 'pending') as 'pending' | 'approved' | 'rejected';

      const payments = await PaymentRequest.find({ user: userId, status })
        .populate({
          path: 'event',
          populate: { path: 'organizer', select: 'name email bkashNumber' },
        })
        .sort({ createdAt: -1 });

      res.json(payments);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/attendee/saved', auth, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const saved = await SavedEvent.find({ user: userId })
        .populate({ path: 'event', populate: { path: 'organizer', select: organizerFields } })
        .sort({ createdAt: -1 });
      res.json(saved.map((s) => s.event));
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/attendee/saved/:eventId', auth, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const event = await Event.findById(req.params.eventId);
      if (!event) return res.status(404).json({ error: 'Event not found' });

      const existing = await SavedEvent.findOne({ user: userId, event: event._id });
      if (existing) return res.json({ message: 'Already saved.', saved: true });

      await SavedEvent.create({ user: userId, event: event._id });
      res.status(201).json({ message: 'Event saved.', saved: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/attendee/saved/:eventId', auth, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      await SavedEvent.deleteOne({ user: userId, event: req.params.eventId });
      res.json({ message: 'Event removed from saved.', saved: false });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/attendee/profile', auth, async (req, res) => {
    try {
      const user = await User.findById((req as any).user.userId).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ user });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/attendee/profile', auth, async (req, res) => {
    try {
      const { userId } = (req as any).user;
      const { name, currentPassword, newPassword } = req.body;

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      if (name) user.name = name;

      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ error: 'Current password is required to set a new password.' });
        }
        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) return res.status(400).json({ error: 'Current password is incorrect.' });
        if (newPassword.length < 6) {
          return res.status(400).json({ error: 'New password must be at least 6 characters.' });
        }
        user.password = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
      }

      await user.save();
      res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // Vite Middleware for Frontend
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, host: true, allowedHosts: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const staticRoot = path.dirname(process.argv[1] || path.join(process.cwd(), "dist"));
    console.log(`Serving static files from: ${staticRoot}`);
    app.use(express.static(staticRoot));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api")) {
        return res.status(404).json({ error: "Not found" });
      }
      res.sendFile(path.join(staticRoot, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EventHive running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
