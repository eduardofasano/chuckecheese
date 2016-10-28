module.exports = {
  index:  restaurantsIndex,
  show:   restaurantsShow,
  create: restaurantsCreate,
  update: restaurantsUpdate,
  delete: restaurantsDelete
};

const Restaurant = require("../models/restaurant");

function restaurantsIndex(req, res){
  Restaurant.find({}, (err, restaurants) => {
    if (err) return res.status(500).json({ message: "Something went wrong." });
    return res.status(200).json({ restaurants });
  });
}

function restaurantsShow(req, res){
  Restaurant.findById(req.params.id, (err, restaurant) => {
    if (err) return res.status(500).json({ message: "Something went wrong." });
    if (!restaurant) return res.status(404).json({ message: "No restaurant was found." });
    return res.status(200).json({ restaurant });
  });
}

function restaurantsCreate(req, res){
  Restaurant.create(req.body.restaurant, (err, restaurant) => {
    if (err) return res.status(500).json({ message: "Something went wrong." });
    return res.status(201).json({ restaurant });
  });
}

function restaurantsUpdate(req, res){
  Restaurant.findByIdAndUpdate(req.params.id, req.body.restaurant, { new: true }, (err, restaurant) => {
    if (err) return res.status(500).json({ message: "Something went wrong." });
    return res.status(200).json({ restaurant });
  });
}

function restaurantsDelete(req, res){
  Restaurant.findByIdAndRemove(req.params.id, err => {
    if (err) return res.status(500).json({ message: "Something went wrong." });
    return res.status(204).json({ message: "Deleted." });
  });
}
