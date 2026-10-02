
## chromium 153.0.8010.12

| scenario | focus after navigation | in viewport | focus after Tab | `<h1>`s in the DOM |
| --- | --- | --- | --- | --- |
| content link, soft | `<body>` | - | link "First link in page A" | Page A |
| content link, hard | `<body>` | - | link "Header: Home" | Page A |
| footer link, soft | link "Footer: B" | no (top 1200px) | link "Footer: A (hard)" | Page B |
| footer link, hard | `<body>` | - | link "Header: Home" | Page B |

## firefox 155.0

| scenario | focus after navigation | in viewport | focus after Tab | `<h1>`s in the DOM |
| --- | --- | --- | --- | --- |
| content link, soft | `<body>` | - | link "First link in page A" | Page A |
| content link, hard | `<body>` | - | link "Header: Home" | Page A |
| footer link, soft | link "Footer: B" | no (top 1223px) | link "Footer: A (hard)" | Page B |
| footer link, hard | `<body>` | - | link "Header: Home" | Page B |

## webkit 26.6

| scenario | focus after navigation | in viewport | focus after Tab | `<h1>`s in the DOM |
| --- | --- | --- | --- | --- |
| content link, soft | `<body>` | - | link "First link in page A" | Page A |
| content link, hard | `<body>` | - | link "Header: Home" | Page A |
| footer link, soft | link "Footer: B" | no (top 1218px) | link "Footer: A (hard)" | Page B |
| footer link, hard | `<body>` | - | link "Header: Home" | Page B |
