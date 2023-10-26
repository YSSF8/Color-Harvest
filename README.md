# Color Harvest

Welcome to the ColorHarvest Playground! This is a web application that uses the ColorHarvest API to extract the four most dominant colors from an image.

## Features
- Supports:
  - URLs
  - Data URLs
- Gives the 4 most dominant colors from the image. Supported formats:
  - HEX
  - RGB
  - HSL

## Example
- Usage (JavaScript):
```javascript
fetch('https://colorharvest.darksidex37.repl.co', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    imageUrl: 'https://i.gadgets360cdn.com/large/rick_astley_youtube_1627540038486.jpg'
  })
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(error => alert(error.message));
```
- Response
```json
{
  "colors": [
    {
      "hex": "#a4a4b6",
      "hsl": [
        240,
        10.975609756097558,
        67.84313725490196
      ],
      "rgb": [
        164,
        164,
        182
      ]
    },
    {
      "hex": "#3f3425",
      "hsl": [
        34.615384615384606,
        25.999999999999996,
        19.607843137254903
      ],
      "rgb": [
        63,
        52,
        37
      ]
    },
    {
      "hex": "#957066",
      "hsl": [
        12.765957446808502,
        18.725099601593627,
        49.21568627450981
      ],
      "rgb": [
        149,
        112,
        102
      ]
    },
    {
      "hex": "#b6bcd5",
      "hsl": [
        228.38709677419354,
        26.95652173913044,
        77.45098039215686
      ],
      "rgb": [
        182,
        188,
        213
      ]
    }
  ],
  "image": "https://i.gadgets360cdn.com/large/rick_astley_youtube_1627540038486.jpg"
}
```

## API
This application uses the ColorHarvest API, which is designed to extract the most dominant colors from an image. The API is hosted separately and is under the MIT license.

## License
This project is licensed under the MIT License.
