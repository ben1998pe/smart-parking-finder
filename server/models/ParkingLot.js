const mongoose = require('mongoose');

const ParkingLotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a parking lot name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Please add a street address']
    },
    city: {
      type: String,
      required: [true, 'Please add a city']
    },
    state: {
      type: String,
      required: [true, 'Please add a state']
    },
    zipCode: {
      type: String,
      required: [true, 'Please add a zip code']
    },
    country: {
      type: String,
      required: [true, 'Please add a country'],
      default: 'United States'
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: [true, 'Please add coordinates'],
      index: '2dsphere'
    }
  },
  totalSpots: {
    type: Number,
    required: [true, 'Please add total number of spots'],
    min: [1, 'Total spots must be at least 1']
  },
  availableSpots: {
    type: Number,
    required: [true, 'Please add available spots'],
    min: [0, 'Available spots cannot be negative']
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Please add hourly rate'],
    min: [0, 'Hourly rate cannot be negative']
  },
  dailyRate: {
    type: Number,
    min: [0, 'Daily rate cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  amenities: [{
    type: String,
    enum: [
      'security',
      'covered',
      'electric-charging',
      'disabled-access',
      'valet',
      'shuttle',
      'bike-rack',
      'motorcycle-spots',
      'truck-spots',
      '24-7-access'
    ]
  }],
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  isOpen: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    url: String,
    caption: String
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for occupancy percentage
ParkingLotSchema.virtual('occupancyPercentage').get(function() {
  if (this.totalSpots === 0) return 0;
  return Math.round(((this.totalSpots - this.availableSpots) / this.totalSpots) * 100);
});

// Virtual for isAvailable
ParkingLotSchema.virtual('isAvailable').get(function() {
  return this.availableSpots > 0 && this.isOpen && this.isActive;
});

// Index for geospatial queries
ParkingLotSchema.index({ location: '2dsphere' });

// Index for search
ParkingLotSchema.index({ 
  name: 'text', 
  description: 'text',
  'address.city': 'text',
  'address.state': 'text'
});

module.exports = mongoose.model('ParkingLot', ParkingLotSchema); 