# rm(list = ls())
library(httr)
library(ggmap)
library(dplyr)
library(bitops)
source("~/Google Drive/kis/keys.R")

# To access the Google Maps Directions API over HTTP, use:
# http://maps.googleapis.com/maps/api/directions/output?parameters

# Parameters: 
#   Origin - The address, textual latitude/longitude value, or place ID from which you wish to calculate directions.
#   Destination -The address, textual latitude/longitude value, or place ID to which you wish to calculate directions.
#   Key - Your application's API key. This key identifies your application for purposes of quota management. Learn how to get a key.
api_addy_directions <- "https://maps.googleapis.com/maps/api/directions/json?"
api_addy_roads <- "https://roads.googleapis.com/v1/snapToRoads?"
all_data <- data.frame() # Defining a blank dataframe to hold the journey data.

# Read in Rivals Data
rivals_250 <- read.csv("~/Desktop/rivals_250.csv", header = TRUE, stringsAsFactors = FALSE)

# Getting the cities into the proper form
my_cities <- vector()[1:nrow(rivals_250)]
for(i in 1:nrow(rivals_250)) {
  split <- strsplit(rivals_250$Location[i],",")
  city <- paste(split[[1]][1], substr(split[[1]][2], 1, 3), sep = ",")
  print(city)
  my_cities[i] <- city
}

my_cities_coded <- geocode(my_cities)

# To generate the path for the Roads API
gen_path <- function(lats, longs) {
  lats <- as.character(lats)
  longs <- as.character(longs)
  coords <- paste(lats, longs, sep = ",", collapse = "|")
  coords_path <- paste("path=", coords, sep = "")
  return(coords_path)
}

get_http_str <- function(var, var_value) {
    return(paste(var, "=", var_value, "&", sep = ""))
}

# Here is the old code for generating routes
############################################################
# This will generate the data for each trip.
from_cities <- geocode(c("Norman, OK", "Austin, TX", "Tuscaloosa, AL", "Los Angeles, CA",
                         "Ann Arbor, MI", "Columbus, OH", "Stanford, CA", "Seattle, WA"))
from_cities$name <- c("Norman, OK", "Austin, TX", "Tuscaloosa, AL", "Los Angeles, CA",
                     "Ann Arbor, MI", "Columbus, OH", "Stanford, CA", "Seattle, WA")

all_trips <- data.frame()
# Need to handle the case where top recruits are coming from the same city.
make_journey <- function(origin, dest_vec, polyline = TRUE) {
  for(i in 1:nrow(origin)) {
    
    for(j in 1:nrow(dest_vec)) {
      
      origin_str <- paste("origin=", origin$lat[i], ",", origin$lon[i], sep = "")
      destination_str <- paste("&destination=", dest_vec$lat[j], ",", dest_vec$lon[j], sep = "")
  
      # Form Request
      request <- paste(api_addy_directions, origin_str, destination_str, key2, sep = "")
      
      # Make request
      dir_response <- GET(request)
#       print(dir_response)
      
      # Response
      resp_contents <<- content(dir_response)
#       print(resp_contents)
      
      if(!polyline) {
        path <- decodeLine(resp_contents$routes[[1]]$overview_polyline$points)
        path$journey <- j
      } else {
         polyline_en <- resp_contents$routes[[1]]$overview_polyline$points
         journey <- j
         distance <- resp_contents$routes[[1]]$legs[[1]]$distance$value
         duration <- resp_contents$routes[[1]]$legs[[1]]$duration$value
         path <- data.frame(polyline_en, journey, origin$name[i], distance, duration)
       }
  
      all_trips <- rbind(all_trips, path)
      Sys.sleep(0.05)
      
    }
  }
  return(all_trips)
}
############################################################

data <- make_journey(from_cities, my_cities_coded, TRUE)

write.table(data, 
            file = "~/Google Drive/Routes to 'Cruits/routes_to_cruits/my_data/path_data.csv", 
            row.names = FALSE, sep = ",", col.names = FALSE, append = TRUE)



# Make Map
my_map <- get_map(location = "USA", zoom = 4, maptype = "roadmap")
my_mapf <- ggmap(my_map)

# Not working because those are the locations of the turns.
my_mapf +
  geom_path(aes(x = lon, y = lat, group = journey), data = data, size = 0.5, col = "red", alpha = 0.10)
