# product tray proof of concept
###### sam galison / duggal -- 2018


## instructions for launching:

This thing works in two parts: 
1. There's a raspberry pi (inside the box) which talks directly to the sensors and also acts a web server.
2. There's a client- (or browser-)side application that listens to this server and controls video playback (and, in the future, all the UI).

---

### to start the pi server:

1. plug in the power cable
2. plug in the ethernet to another computer (in our current setup, the Nuc)
3. on the Nuc, open a Git Bash terminal window and enter the following:
   ```bash
   ssh pi@169.254.149.56
   # this tunnels into the raspberry pi; 
   # it'll ask you for a password, enter "raspberry" (without the quotes)
   cd productfinder/nodetest
   npm start
   ```
   You should see some code-y nonsense spit out, and then if all's well it'll say "listening on :3000". If you leave this window open, you'll also see "a user connected" when you open the client-side listener (below).

---

### to start the client-side web app:

1. open a new windows powershell terminal window (because windows makes everything difficult)
2. enter the following:
   ```bash
   cd remote-listener
   npm start
   ```
   This will load up the project and launch it in a new browser window.

---

### to shut down the server:
- Click on the Git Bash window in which you did the `ssh` command and do CTRL+C. This'll shut down the server process.
- if you closed that window but want to safely shut down the pi, do
  ```bash
  ssh pi@169.254.149.56
  # password is raspberry
  sudo shutdown now
  ```
  (unplug and plug it back in to turn it on, or you can instead do `sudo reboot`)
  
---

### to shut down the client:
- find the (blue) powershell window running the process -- you should see a bunch of green text and web loading codes like 200 304 etc. Click on it and do CTRL+C. Answer `y` if it asks.

