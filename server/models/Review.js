const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  parkingLot: {
    type: mongoose.Schema.ObjectId,
    ref: 'ParkingLot',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment'],
    maxlength: [500, 'Comment cannot be more than 500 characters']
  },
  pros: [{
    type: String,
    maxlength: [50, 'Pro cannot be more than 50 characters']
  }],
  cons: [{
    type: String,
    maxlength: [50, 'Con cannot be more than 50 characters']
  }],
  visitDate: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  helpful: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    isHelpful: Boolean
  }],
  images: [{
    url: String,
    caption: String
  }]
}, {
  timestamps: true
});

// Prevent user from submitting more than one review per parking lot
ReviewSchema.index({ parkingLot: 1, user: 1 }, { unique: true });

// Static method to get average rating
ReviewSchema.statics.getAverageRating = async function(parkingLotId) {
  const obj = await this.aggregate([
    {
      $match: { parkingLot: parkingLotId }
    },
    {
      $group: {
        _id: '$parkingLot',
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  try {
    await this.model('ParkingLot').findByIdAndUpdate(parkingLotId, {
      rating: {
        average: obj[0] ? Math.round(obj[0].averageRating * 10) / 10 : 0,
        count: obj[0] ? obj[0].count : 0
      }
    });
  } catch (err) {
    console.error('Error updating parking lot rating:', err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.parkingLot);
});

// Call getAverageRating before remove
ReviewSchema.pre('remove', function() {
  this.constructor.getAverageRating(this.parkingLot);
});

module.exports = mongoose.model('Review', ReviewSchema); 