const dotenv = require('dotenv');
dotenv.config();

var Flickr = require("flickrapi"),
    flickrOptions = {
      api_key: process.env.FLICKR_API_KEY,
      secret: process.env.FLICKR_API_SECRET,
      user_id: "157585171@N05",
      requestOptions: {
        timeout: 20000,
        /* other default options accepted by request.defaults */
      }
    };

Flickr.tokenOnly(flickrOptions, function(error, flickr) {
  flickr.photos.search({
    user_id: flickr.options.user_id,
    // authenticated: true,
    page: 1,
    per_page: 5
  }, function(error, result) {
    if(error) console.error(error)
    photos = result.photos;
    randomPhoto = result.photos.photo[Math.floor(Math.random()*result.photos.photo.length)]
    console.log('randomPhoto', randomPhoto)
    console.log(`http://farm${randomPhoto.farm}.staticflickr.com/${randomPhoto.server}/${randomPhoto.id}_${randomPhoto.secret}_k.jpg    `)

    // let photoId = randomValue(result.photos.photo)
    // console.log(photos)
  });
});
