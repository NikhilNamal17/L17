const path = require("path")
const express = require("express")
const helmet = require("helmet")
const morgan = require("morgan")
const yup = require("yup")
const monk = require("monk")
const { nanoid } = require("nanoid")
const { error } = require("console")
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

const schema = yup.object().shape({
    url: yup.string().trim().url().required(),
    slug: yup.string().trim().matches(/^[\w\-]+$/i)
})

app.get('/:id', async (req, res, next) => {
    const { id: slug } = req.params;
    try {
        const url = await urls.findOne({ slug });
        if (url) {
            return res.redirect(url.url);
        }
        return res.status(404).sendFile(notFoundPath);
    } catch (error) {
        return res.status(404).sendFile(notFoundPath);
    }
});


app.post("/url", async (req, res, next) => {
    let { url, slug } = req.body
    try {
        await schema.validate({
            slug,
            url
        })

        if (!slug) {
            slug = nanoid(5)

        }
        slug = slug.toLowerCase()
        const newUrl = {
            url,
            slug,
        };
        const created = await urls.insert(newUrl);
        res.json(created);
        // res.json({
        //     slug,
        //     url
        // })

    } catch (error) {
        next(error)
    }
})

app.use((error, rer, res, next) => {
    if (error.status) {
        res.status(error.status)
    } else {
        res.status(500)
    }
    res.json({
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? "cool" : error.stack
    })
})


app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));
