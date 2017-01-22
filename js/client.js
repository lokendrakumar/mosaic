// Edit me. Feel free to create additional .js files.
var image = '';
var reader = '';
var image_pieces = [];
var width_count = '';
var height_count = '';
var promiseArry = [];
var baseUrl = 'http://localhost:8765'
// main function to start image processing
function loadImage()
{
      var file = document.getElementById('image').files[0]
      image = new Image();
      //after image load cut into pieces
      image.onload = cutImageIntiPieces;
      reader  = new FileReader();
      reader.onload = updateImage;
      if (file) {
        reader.readAsDataURL(file);
      }
}

function updateImage()
{
  var showImage = document.getElementById('showimage')
  image.src = reader.result;
  showImage.src = reader.result;
}

//slice image in 16*16 tiles
function cutImageIntiPieces()
{
    document.getElementById('appened-image').innerHTML ='';
    //calculate
    width_count = image.width/TILE_WIDTH;
    height_count = image.height/TILE_HEIGHT;
    for(var x = 0; x < height_count; ++x) {
      promiseArry = [];
        for(var y = 0; y < width_count; ++y) {
            var canvas = document.createElement('canvas');
            canvas.width = TILE_WIDTH;
            canvas.height = TILE_HEIGHT;
            var context = canvas.getContext('2d');
            //drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
            context.drawImage(image, y * TILE_WIDTH, x * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT, 0, 0, canvas.width, canvas.height);
            image_pieces.push(canvas.toDataURL());
            getAverageRGB(canvas);

          }
          printRow();
    }
}

// calculate everage rgb color for a tile
function getAverageRGB(imgEl)
{
    var blockSize = 5, // only visit every 5 pixels
        defaultRGB = {r:0,g:0,b:0}, // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = {r:0,g:0,b:0},
        count = 0;

    if (!context) {
        return defaultRGB;
    }

    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

    context.drawImage(imgEl, 0, 0);

    try {
        data = context.getImageData(0, 0, width, height);
    } catch(e) {
        /* security error, img on diff domain */alert('x');
        return defaultRGB;
    }

    length = data.data.length;

    while ( (i += blockSize * 4) < length ) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i+1];
        rgb.b += data.data[i+2];
    }

    // ~~ used to floor values
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);

    rgbTwohexConversion(rgb.r, rgb.g, rgb.b);

}
//conver rgb colour into hex
function rgbTwohexConversion(red, green, blue)
{
      var rgb = blue | (green << 8) | (red << 16);
      var hex =  (0x1000000 + rgb).toString(16).slice(1)
      //Create Promise For Every Hex code
      promiseArry[hex] = new Promise((resolve, reject) => {
          sendDataToServer(hex, resolve);
      });
}

// get mosaic tile from server for hex
function sendDataToServer(hex, resolve)
{
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function()
    {
        if (this.readyState == 4 && this.status == 200)
        {
            resolve( this.responseText);
        }
    };
    var url = baseUrl+"/color/"+hex;
    xhttp.open("GET", url, true);
    xhttp.send();
}

// print single row image data
function printRow()
{
      var arryKey = Object.keys(promiseArry);
      var rowArry = [];
      for (var i = 0; i < arryKey.length; i++)
      {
          rowArry.push(promiseArry[arryKey[i]]);
      }
      // Promise for single row
      Promise.all(rowArry).then(values => {
          var rowHtml = '';
          for (var i = 0; i < values.length; i++)
          {
              rowHtml += values[i];
          }
          var div = document.createElement('div');
          div.innerHTML = rowHtml;
          document.getElementById('appened-image').appendChild(div);
      }, reason => {

      });

}
