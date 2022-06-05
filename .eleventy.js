const { minify } = require("html-minifier-terser");

const { minify: terser } = require("terser");

const path = require("node:path");

const randomId = () => Math.random().toString(16).slice(2);
const uui = () => `${randomId()}-${randomId()}`;

/** @param {import('@11ty/eleventy/src/UserConfig')} config */
module.exports = config => {
  console.log(process.env.NODE_ENV)
  if (process.env.NODE_ENV === "production") {
    config.addTransform("htmlmin", async (content, outputPath) => {
      if (outputPath && outputPath.endsWith(".html")) {
        let minified = await minify(content, {
          useShortDoctype: true,
          removeComments: true,
          collapseWhitespace: true,
          minifyJS: true,
          minifyCSS: true,
          customAttrCollapse: /d/,
          ignoreCustomFragments: [],
        });
        return minified;
      }

      return content;
    });
    config.addTemplateFormats("js");
    config.addExtension("js", {
      outputFileExtension: "js",
      compile: async (inputContent, inputPath) => {
        const parsed = path.parse(inputPath);
        if (parsed.name.startsWith("_")) {
          return;
        }
        return async () => {
          return (await terser(inputContent)).code;
        };
      },
    });
  } else {
    config.setServerOptions({
      https: {
        cert: "/Users/marcusaldrin/work/templates/11ty/cert/cert.pem",
        key: "/Users/marcusaldrin/work/templates/11ty/cert/key.pem",
      },
    });
    config.addPassthroughCopy("./src/js/");
    config.addWatchTarget("./src/components/**/*.js");
  }

  config.addPassthroughCopy("./src/css/");
  config.addPassthroughCopy({ "./static": "/assets" });

  // config.addPassthroughCopy("./src/_sw.js");
  config.addCollection("pages", collectionsApi => {
    return collectionsApi.getFilteredByGlob("**/*.njk");
  });

  config.addNunjucksAsyncFilter("jsmin", async (s, cb) =>
    cb(null, (await terser(s)).code)
  );

  config.addNunjucksShortcode("hash", () => `${new Date()}-${uui()}`);
  return {
    dir: {
      input: "src",
    },
  };
};
