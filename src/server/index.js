const express = require("express")
const helmet = require("helmet")
const morgan = require("morgan")
const yup = require("yup")
const monk = require("monk")
const { nanoid } = require("nanoid")
require("dotenv").config()

const app = express()
app.use(express.static('dist'))
app.enable('trust proxy');
app.use(helmet());
app.use(morgan('common'));
app.use(express.json());

const db = monk(process.env.MONGODB_URI)
const urls = db.get("urls")
urls.createIndex({ slug: 1 }, { unique: true });

// schema for url 
const schema = yup.object().shape({
    url: yup.string().trim().url().required(),
    slug: yup.string().trim().matches(/^[\w\-]+$/i)
})

app.get('/:id', async (req, res, next) => {
    const { id: slug } = req.params; //rename id as slug
    try {
        const url = await urls.findOne({ slug }); //get slug from db
        if (url) {
            return res.redirect(url.url);  //redirect to url 
        }
        return res.status(404).sendFile(notFoundPath);
    } catch (error) {
        return res.status(404).sendFile(notFoundPath);
    }
});


app.post("/url", async (req, res, next) => {
    let { url, slug } = req.body     // get url and slug from req body
    try {
        await schema.validate({      // validate if data from req same as schema format
            slug,
            url
        })

        if (!slug) {
            slug = nanoid(5)    //if slug doesn't exist, nanoid creates a random 5 digit slug

        } else {
            const existing = await urls.findOne({ slug });  //check if slug is already present in db
            if (existing) {
                throw new Error('Slug in use. 🍔');
            }
        }
        slug = slug.toLowerCase();   //slug to lowercase for security measures 
        const newUrl = {
            url,
            slug,
        };
        const created = await urls.insert(newUrl);  // insert newUrl in db
        res.json(created);


    } catch (error) {
        next(error)
    }
})

app.use((error, rer, res) => {
    if (error.status) {
        res.status(error.status)
    } else {
        res.status(500)
    }
    res.json({
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? "🍔" : error.stack
    })
})


app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));
