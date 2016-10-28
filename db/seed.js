const mongoose   = require("mongoose");
const config     = require("../config/config");
const Restaurant = require("../models/restaurant");
const path       = require("path");

mongoose.connect(config.db);

// Clear the collection so we don't get duplicates
Restaurant.collection.drop();

// Using .save
let restaurant1 = new Restaurant({
  name: "Wagamamas Shoreditch",
  image: "http://www.wagamama.com/~/media/WagamamaMainsite/food-category-images/teppanyaki.jpg",
  description: "Wagamama means selfish child in Japanese",
  lat: "51.5197921",
  lng: "-0.0757066"
});
restaurant1.save((err, restaurant) => console.log(`${restaurant.name} was saved.`));

// Using .create
Restaurant.create({
  name: "Mildred's",
  image: "http://www.mildreds.co.uk/content/uploads/2016/02/healscurry-768x492.jpg",
  description: "Vegetarian place is Soho.",
  lat: "51.5130275",
  lng: "-0.1386266"
}, (err, restaurant) => console.log(`${restaurant.name} was saved.`));

// Using an array & .create
const restaurants = [
  {
    name: "Byron Burger Shoreditch",
    image: "http://www.thelondoner.me/wp-content/uploads/2014/12/byronroquefortburger-3-sPCgW2zSC6zTQkHm7kAkh5.jpg",
    description: "Is it Australian?",
    lat: "51.5254678",
    lng: "-0.0818591"
  },
  {
    name: "Bleecker Street",
    image: "http://now-here-this.timeout.com/wp-content/uploads/2015/02/15669707353_a2a1b9c149_o.jpeg",
    description: "The same spelling as the street in New York.",
    lat: "51.5199128",
    lng: "-0.0772997"
  },
];

restaurants.forEach((restaurant) => {
  Restaurant.create(restaurant, (err, restaurant) => {
    console.log(`${restaurant.name} was saved.`);
  });
});
