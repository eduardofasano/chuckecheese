# chuckecheese
#Disaster Squawk

###GA WDI Project 2 William Hilton, Eduardo Fasano, Sarah Penny, Ervis Priftis 2016

###Check out Disaster Squawk [here] (http://disastersquawk.herokuapp.com/)

![] (https://i.imgur.com/rgDKVEJ.png)
![] (https://i.imgur.com/AJ4UQcL.png)

###Overview

The second project was to build a full-stack RESTful application that included a Google Map and an authenticated User.
It was built as an Express application that incorporated a Mongo database using the Mongoose ORM

###Technology used

* Javascript
* jQuery
* Express
* HTML5
* CSS3
* Mongo
* bcrypt
* heroku
* git

###Evaluation

Great experience to build a full-stack application within a team. Team dynamic had to be taken into account such as planning, delegation and playing to each individual's strengths. Also great experience working with external APIs and to see how those worked and the challenges faced. All in all really fun project due to great group spirit and that everyone was really behind the project from its conception.


###Process

The process through which this project was started was due to a multitude of facts. First of all, one of the requirements for the project was to utilise Google Maps. The idea of natural events was of keen interest to our team as we did not think there are enough resources giving information about current natural events. So what a better place to start by mapping these current events and provide the user with real time information. With an extensive search for external APIs of that subject matter, NASA provided a frequently updated list of disasters with their exact coordinates. However it proved to be light on actual information about these events, so we turned to Twitter. This enabled us to not only plot these events but to also grab information about said disaster and display it in real time.
Overall the project turned out to our teams satisfaction and  everyone was very pleased with final product.  

###Challenges
* Main challenges faced were to do with the external APIs. First of all the originally selected API, for the natural disasters, provided a wealth of information but only the coordinates for the capital city of that county - Not great in our eyes. This lead us to using the NASA's. Here the challenge was the plotting the coordinates as a circle to best represent the disaster.
* Another challenge was working with the Twitter. This proved difficult to implement effectively on our site as we had to overcome obstacles such as not rendering the relevant tweets about specific disasters. This was overcome but creating a function to filter the tweets according the the title of the disaster.  

###What Next?

* Any updates for the future would to include a FaceBook oauth feature, to entice users more easily to the site. Other improvements would be a load more tweets button. Perhaps also to include a searching feature based on timescale, so a user could see information about previous disasters.
