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

          body {
            height:100vh;
            width:100vw;
            overflow:hidden;
            font-family: Lato, "Trebuchet MS", "Verdana", "sans-serif";
          }
          
          #loginbutton {
            width: 350px;
            height:50px;
            border-radius:180px;
            position:relative;
            background: linear-gradient(60deg, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82);
            cursor:pointer;
            line-height:12px;
          }
          
          #loginbutton:before {
            z-index:1;
            position:absolute;
            display:block;
            width:80%;
            height:70%;
            top:15%;
            left:10%;
            transition: 0.3s opacity ease-in-out;
            filter:blur(15px);
            opacity:0;
            background: linear-gradient(60deg, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82);
          }
          
          #loginbutton:hover:before {
            opacity:1;
            transition: 0.3s opacity ease-in-out;
            filter:blur(25px);
            background: linear-gradient(60deg, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82);  
          }
          
          #loginbutton:after {
            content:'Go to Dashboard';
            text-align:center;
            line-height:40px;
            font-size:18px;
            color:rgba(235,235,235,1);
            font-weight:bold;
            z-index:5;
            position:absolute;
            display:block;
            border-radius:180px;
            width:92%;
            height:80%;
            top:10%;
            left:4%;  
            background-color:rgb(19, 20, 22);
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
                  <span>Kudos </span> <b><br /> Appreciation, Engagement and Recognition Bot</b><br /> <span> Built for digital teams!</span>
              </h1>
          </div>
          <div class="buttonContainer">
              <a href="/login">
                <div id="loginbutton"></div>
              </a>
          </div>
          <div class="footerContainer">
              <p>We are in beta!</p>
          </div>
      </div>
  </body>

  </html>`

export default landingPageTemplate
