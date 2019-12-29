const dotenv = require('dotenv');
dotenv.config();
var Masto = require('mastodon')
const download = require('image-downloader')
var fs = require('fs');
const url = require('flickr-photo-url')
const Flickr = require('flickr-sdk');
const randomInt = require('random-int');

var flickr = new Flickr(process.env.FLICKR_API_KEY);
const flickrUserId = "157585171@N05";

var M = new Masto({
  access_token: process.env.MASTADON_ACCESS_TOKEN,
  api_url: 'https://chaos.social/api/v1/',
})

async function getFlickrPhotos(){
  return await flickr.photos.search({
    user_id: flickrUserId,
    page: 1,
    per_page: 500,
  }).then(function (res) {
    return res.body
  }).catch(function (err) {
    console.error('bonk', err);
    return err
  })
}

async function downloadPhoto(url){
  return await download.image({
    url: url,
    dest: './'
  })
  .then(({ filename, image }) => {
    return filename
  })
}

async function getPhotoInfo(photo_id){
  return await flickr.photos.getInfo({
    photo_id: photo_id // sorry, @dokas
  }).then(function (res) {
    return res.body;
  }).catch(function (err) {
    return err;
  });
}

function getLicenseText(license){
  switch (+license){
    case 0:
      return "All Rights Reserved";
    case 1:
      return "Attribution-NonCommercial-ShareAlike License"; // https://creativecommons.org/licenses/by-nc-sa/2.0/
    case 2:
      return "Attribution-NonCommercial License"; // https://creativecommons.org/licenses/by-nc/2.0/
    case 3:
      return "Attribution-NonCommercial-NoDerivs License"; // https://creativecommons.org/licenses/by-nc-nd/2.0/
    case 4:
      return "CC-BY"; // https://creativecommons.org/licenses/by/2.0/
    case 5:
      return "Attribution-ShareAlike License"; // https://creativecommons.org/licenses/by-sa/2.0/
    case 6:
      return "Attribution-NoDerivs License"; // https://creativecommons.org/licenses/by-nd/2.0/
    case 7:
      return "No known copyright restrictions"; // https://www.flickr.com/commons/usage/
    case 8:
      return "United States Government Work"; // http://www.usa.gov/copyright.shtml
    case 9:
      return "CC-0"; //  https://creativecommons.org/publicdomain/zero/1.0/
    case 10:
      return "Public Domain Mark"; // https://creativecommons.org/publicdomain/mark/1.0/
  }
}

async function main(){
  const flickrPhotos = await getFlickrPhotos();
  console.log('flickrPhotos.photos.photo.length',flickrPhotos.photos.photo.length)
  const randomPhoto = flickrPhotos.photos.photo[randomInt(flickrPhotos.photos.photo.length)]
  const randomPhotoUrl = await url(flickrUserId, +randomPhoto.id, url.sizes.large)
  const filePath = await downloadPhoto(randomPhotoUrl)
  const photoInfo = await getPhotoInfo(+randomPhoto.id)
  const licenseText = getLicenseText(photoInfo.photo.license)
  const flickrUrl = `https://www.flickr.com/photos/ctfl/${randomPhoto.id}`
  const text = `This is what chaos looks like - 📸  ${licenseText} ${flickrUrl}`

  var id;
  M.post('media', { file: fs.createReadStream(`./${filePath}`) }).then(resp => {
    id = resp.data.id;
    M.post('statuses', { status: text, media_ids: [id] })
  })
  .catch((err) => console.error(err))

  // delete photo file after Posting
  fs.unlinkSync(filePath)

  console.log('DONE')

}

main()
