const landingPageTemplate = `<!DOCTYPE html>
  <html lang="en">

  <head>
      <!-- Google Tag Manager -->
      <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-TM22QJ5');</script>
      <!-- End Google Tag Manager -->
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Open Kudos: Open Source Slack employee recognitions bot</title>
      <style>
          .mainContainer {
              font-family: 'Segoe UI', Roboto, sans-serif;
              width: 100%;
              text-align: center;
              padding-top: 10%;
          }

          .greetingContainer {
              font-size: 2em;
          }
          .greetingContainer > h1 > span
          {
              font-weight: 100;
          }

          .buttonContainer {
              width: 200px;
              margin: 20px auto;
              background-color: #eaeaea;
              border-radius: 10px;
              height: 40px;
              padding: 30px;
              border: 1px solid #cccccc;
              display: table;
          }

          .footerContainer {
              font-size: 1em;
              color: #b1b1b1;
          }
      </style>
  </head>

  <body>
  <!-- Google Tag Manager (noscript) -->
      <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TM22QJ5"
      height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->
      <div class="mainContainer">
          <div class="greetingContainer">
              <h1>
                  <span>Open Source Slack </span> <b>employee<br /> recognitions bot</b> <span> built for<br /> digital teams!</span>
              </h1>
          </div>
          <div class="buttonContainer">
              <a href="{0}">
                  <img alt="Add to Slack" height="40" width="139"
                      src="https://platform.slack-edge.com/img/add_to_slack.png"
                      srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" />
              </a>
          </div>
          <div class="footerContainer">
              <p>We are in beta!</p>
          </div>
      </div>
  </body>

  </html>`

export default landingPageTemplate
