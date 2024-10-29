// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.discordapp.net',
        port: '',
        pathname: '/attachments/**', // Adjust the path as needed
      },
      {
        protocol: 'https',
        hostname: 'media.discordapp.net',
        port: '',
        pathname: '/attachments/**', // Adjust the path as needed
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
        pathname: '/a/**', // Adjusted for the given URL pattern
      },
    ],
  },
};
