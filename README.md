<img src="https://i.ibb.co/wrL2V0W6/kenji-cloud-cover.jpg" alt="banner">
<h1 align="center"><img src="https://i.ibb.co/ZpZxdbP2/kenji-cloud-main.jpg" width="30px">Kenji Cloud Bot - Bot Chat Messenger</h1>

<p align="center">
  <a href="https://github.com/1dev-hridoy/Kenji-Cloud"><img src="https://img.shields.io/github/stars/1dev-hridoy/Kenji-Cloud?color=green" /></a>
  <a href="https://github.com/1dev-hridoy/Kenji-Cloud/issues"><img src="https://img.shields.io/github/issues/1dev-hridoy/Kenji-Cloud?color=red" /></a>
  <a href="https://github.com/1dev-hridoy/Kenji-Cloud"><img src="https://img.shields.io/github/license/1dev-hridoy/Kenji-Cloud?color=blue" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/node/v/latest?color=purple" /></a>
  <a href="https://github.com/1dev-hridoy/Kenji-Cloud/actions"><img src="https://img.shields.io/badge/build-passing-yellowgreen" /></a>
</p>


A powerful Facebook Messenger bot with commands for media downloading, uptime tracking, and more. Built for ease of use and customization.

## Overview

Kenji Cloud is an open-source bot designed to enhance Messenger group chats with features like video downloads (Facebook, Instagram, TikTok, YouTube), uptime monitoring, and custom goodbye messages. It’s lightweight, extensible, and perfect for community management.

## Technologies

![Tech Stack](https://skillicons.dev/icons?i=nodejs,js,html,css,axios,express,mongodb,git)

-   **Node.js**: Runtime for the bot.
-   **JavaScript**: Core scripting language.
-   **HTML/CSS**: For web dashboard.
-   **Axios**: HTTP requests for APIs.
-   **Express**: Web server framework.
-   **MongoDB**: Data persistence.
-   **Git**: Version control.

## Installation

### Prerequisites

-   Node.js (v18+)
-   npm (comes with Node.js)
-   Git
-   A Facebook account for app state
-   Internet connection

### Steps

1.  **Clone the Repository**:
    
    ```bash
    git clone https://github.com/1dev-hridoy/Kenji-Cloud.git
    cd Kenji-Cloud
    
    ```
    
2.  **Install Dependencies**:
    
    ```bash
    npm install
    
    ```
    
3.  **Set Up Environment**:

    -   Edit `config/config.json` with:

        ```json
        {
          "botName": "Kenji Cloud",
          "prefix": "!",
          "botpicture": "https://i.ibb.co/Xxmdjjfm/Flux-Dev-cinematic-keyframe13-anime-keyframe12-Animestyle-port-2.jpg",
          "ownerName": "Hridoy",
          "ownerUID": "61575746590997",
          "adminUIDs": [
            "61575746590997",
            "another uid"
          ]
        }
        ```
        
    -   Use the c3c utility extension to export a fresh Facebook app state and save it as `appstate.json`.
4.  **Create Directories**:
    
    ```bash
    mkdir config logger/logs database database/backup temp modules/commands/nayan
    
    ```
    
5.  **Run the Bot**:
    
    ```bash
    node .
    
    ```
    
    -   Enter 2FA if prompted.
    -   Access the dashboard at `http://localhost:3000`.
6.  **Test Commands**:
    
    -   Try `!dl https://www.facebook.com/share/v/1J2zkAmJke/` or `!uptime`.

## Samples

### How to Make a Command

Create a file in `modules/commands/` (e.g., `hello.js`):

```javascript
module.exports = {
  config: {
    name: 'hello',
    version: '1.0',
    author: 'Hridoy',
    countDown: 5,
    prefix: true,
    adminOnly: false,
    aliases: ['hlw', 'hi'],
    description: 'replay hello message',
    category: 'box chat',
    guide: {
      en: '   {pn}hello]'
    },

module.exports.run = async ({ api, event }) => {
    api.sendMessage("Hello! 👋", event.threadID);
};

```

-   Use `!hello` to trigger it.

### How to Make an Admin-Only Command

Add `adminOnly:  true,` to restrict to admins (0 for all, 1 for admins):

```javascript
module.exports = {
  config: {
    name: 'hello',
    version: '1.0',
    author: 'Hridoy',
    countDown: 5,
    prefix: true,
    adminOnly: true,
    aliases: ['hlw', 'hi'],
    description: 'replay hello message',
    category: 'box chat',
    guide: {
      en: '   {pn}hello]'
    },
  },

module.exports.run = async ({ api, event }) => {
    api.sendMessage("This is an admin command!", event.threadID);
};

```

-   Only admins can use `!admincmd`.

### How to Make a No-Prefix Command

Set `prefix: false` to trigger without a prefix:

```javascript
module.exports = {
  config: {
    name: '`noprefix',
    version: '1.0',
    author: 'Hridoy',
    countDown: 5,
    prefix: false,
    adminOnly: false,
    aliases: ['hlw', 'hi'],
    description: 'replay hello message',
    category: 'box chat',
    guide: {
      en: '   {pn}hello]'
    },

module.exports.run = async ({ api, event }) => {
    if (event.body.toLowerCase() === "noprefix") {
        api.sendMessage("No prefix needed! 😄", event.threadID);
    }
};

```

-   Typing `noprefix` triggers it.

### How to Make a Group-Admin-Only Command

Add `groupAdminOnly: true` to restrict to group admins:

```javascript
module.exports.config = {
    name: "groupadmin",
    version: "1.0",
    author: "Hridoy",
    countDown: 5,
    prefix: true,
    groupAdminOnly: true,
    description: "Group admin-only command.",
    category: "admin"
};

module.exports.run = async ({ api, event }) => {
    api.sendMessage("Only group admins can see this!", event.threadID);
};

```

-   Only group admins can use `!groupadmin`.

## Support & Contact

-   **Developer**: Hridoy (1dev-hridoy)
    -   **Facebook**: [https://www.facebook.com/1dev.hridoy/](https://www.facebook.com/1dev.hridoy/)
-   **Email**: [bgmohammedhridoy@gmail.com](mailto:bgmohammedhridoy@gmail.com) (replace with actual email)
-   **Messenger**: [Contact Support](https://m.me/j/AbZ7V4ubIwFomn8x/)
-   **Telegram**: [Join Telegram](https://t.me/nexalo)
-   **Discord Server**: [Join Discord](https://discord.gg/acZaWzBegW)

Feel free to report issues, suggest features, or seek help!

## Contributing

Fork the repo, make changes, and submit a pull request. All contributions are welcome!

## License

MIT License 