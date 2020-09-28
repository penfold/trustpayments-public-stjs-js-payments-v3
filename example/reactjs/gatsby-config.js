module.exports = {
  siteMetadata: {
    title: `Trust Payments ReactJS Example Page`,
    description: `Check how our library is working with ReactJS framework, more info: https://docs.securetrading.com/document/javascript-library/`,
    author: `@trustpayments`
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`
      }
    },
    {
      resolve: 'gatsby-plugin-eslint',
      options: {
        test: /\.js$|\.jsx$/,
        exclude: /(node_modules|.cache|public)/,
        stages: ['develop'],
        options: {
          emitWarning: true,
          failOnError: false
        }
      }
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/favicon.ico` // This path is relative to the root of the site.
      }
    },
    `gatsby-plugin-offline`,
    `gatsby-plugin-styled-components`
  ]
};
