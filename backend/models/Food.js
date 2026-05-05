const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
{
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, default: "" },
    isAvailable: { type: Boolean, default: true },
    isVeg: { type: Boolean, default: true },           
    isTrending: { type: Boolean, default: false },     
    isPremium: { type: Boolean, default: false },      
    isChefSpecial: { type: Boolean, default: false },  
    discount: { type: Number, default: 0 },            
    orderCount: { type: Number, default: 0 },          
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 }
},
{ timestamps: true }
);

module.exports = mongoose.models.Food || mongoose.model("Food", foodSchema);