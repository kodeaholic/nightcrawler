var os = require('os');
if (os.platform() == 'win32') {  
    if (os.arch() == 'ia32') {
        var chilkat = require('@chilkat/ck-node11-win-ia32');
    } else {
        var chilkat = require('@chilkat/ck-node11-win64'); 
    }
} else if (os.platform() == 'linux') {
    if (os.arch() == 'arm') {
        var chilkat = require('@chilkat/ck-node11-arm');
    } else if (os.arch() == 'x86') {
        var chilkat = require('@chilkat/ck-node11-linux32');
    } else {
        var chilkat = require('@chilkat/ck-node11-linux64');
    }
} else if (os.platform() == 'darwin') {
    var chilkat = require('@chilkat/ck-node11-macosx');
}

function chilkatExample() {

    // This example requires the Chilkat API to have been previously unlocked.
    // See Global Unlock Sample for sample code.

    var oauth2 = new chilkat.OAuth2();
    var success;

    // For Google OAuth2, set the listen port equal to the port used
    // in the Authorized Redirect URL for the Client ID.
    // For example, in this case the Authorized Redirect URL would be http://localhost:3017/
    // Your app should choose a port not likely not used by any other application.
    oauth2.ListenPort = 3017;

    oauth2.AuthorizationEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
    oauth2.TokenEndpoint = "https://www.googleapis.com/oauth2/v4/token";

    // Replace these with actual values.
    oauth2.ClientId = "GOOGLE-CLIENT-ID";
    oauth2.ClientSecret = "GOOGLE-CLIENT-SECRET";

    oauth2.CodeChallenge = true;
    oauth2.CodeChallengeMethod = "S256";

    // This is a scope for Google Photos.  See https://developers.google.com/photos/library/guides/authentication-authorization
    // This scope provides read/write access but not sharing.
    oauth2.Scope = "https://www.googleapis.com/auth/photoslibrary";

    // Begin the OAuth2 three-legged flow.  This returns a URL that should be loaded in a browser.
    var url = oauth2.StartAuth();
    if (oauth2.LastMethodSuccess !== true) {
        console.log(oauth2.LastErrorText);
        return;
    }

    // At this point, your application should load the URL in a browser.
    // For example, 
    // in C#: System.Diagnostics.Process.Start(url);
    // in Java: Desktop.getDesktop().browse(new URI(url));
    // in VBScript: Set wsh=WScript.CreateObject("WScript.Shell")
    //              wsh.Run url
    // in Xojo: ShowURL(url)  (see http://docs.xojo.com/index.php/ShowURL)
    // in Dataflex: Runprogram Background "c:\Program Files\Internet Explorer\iexplore.exe" sUrl        
    // The Google account owner would interactively accept or deny the authorization request.

    // Add the code to load the url in a web browser here...
    // Add the code to load the url in a web browser here...
    // Add the code to load the url in a web browser here...

    // Now wait for the authorization.
    // We'll wait for a max of 120 seconds.
    var numMsWaited = 0;
    while ((numMsWaited < 120000) && (oauth2.AuthFlowState < 3)) {
        oauth2.SleepMs(100);
        numMsWaited = numMsWaited+100;
    }

    // If there was no response from the browser within 120 seconds, then 
    // the AuthFlowState will be equal to 1 or 2.
    // 1: Waiting for Redirect. The OAuth2 background thread is waiting to receive the redirect HTTP request from the browser.
    // 2: Waiting for Final Response. The OAuth2 background thread is waiting for the final access token response.
    // In that case, cancel the background task started in the call to StartAuth.
    if (oauth2.AuthFlowState < 3) {
        oauth2.Cancel();
        console.log("No response from the browser!");
        return;
    }

    // Check the AuthFlowState to see if authorization was granted, denied, or if some error occurred
    // The possible AuthFlowState values are:
    // 3: Completed with Success. The OAuth2 flow has completed, the background thread exited, and the successful JSON response is available in AccessTokenResponse property.
    // 4: Completed with Access Denied. The OAuth2 flow has completed, the background thread exited, and the error JSON is available in AccessTokenResponse property.
    // 5: Failed Prior to Completion. The OAuth2 flow failed to complete, the background thread exited, and the error information is available in the FailureInfo property.
    if (oauth2.AuthFlowState == 5) {
        console.log("OAuth2 failed to complete.");
        console.log(oauth2.FailureInfo);
        return;
    }

    if (oauth2.AuthFlowState == 4) {
        console.log("OAuth2 authorization was denied.");
        console.log(oauth2.AccessTokenResponse);
        return;
    }

    if (oauth2.AuthFlowState !== 3) {
        console.log("Unexpected AuthFlowState:" + oauth2.AuthFlowState);
        return;
    }

    // Save the full JSON access token response to a file.
    var sbJson = new chilkat.StringBuilder();
    sbJson.Append(oauth2.AccessTokenResponse);
    sbJson.WriteFile("qa_data/tokens/googlePhotos.json","utf-8",false);

    // The saved JSON response looks like this:
    // {
    //   "access_token": "ya29.GlamBqWR6cp8lEfJMmTHVEua45912XLKoq4djyHl_Z3CEIzsPLIZkJSGie5oOrbaggy1rjJHn1zW5bjqSesGr5MEYIp9Hx-0CuvjVYf8srg2jeaDMwMACvzemp43",
    //   "expires_in": 3600,
    //   "refresh_token": "1/rl6k16nysDl9Bp1EhRH9F1WyRIoiSQAvko49Z4yY694MT5V1QXLj2ibNZGaRgek0",
    //   "scope": "https://www.googleapis.com/auth/photoslibrary",
    //   "token_type": "Bearer"
    // }

    console.log("OAuth2 authorization granted!");
    console.log("Access Token = " + oauth2.AccessToken);

}

chilkatExample();