const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dotenv = require("dotenv");
const cheerio = require("cheerio");

// SET UP
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.listen(process.env.PORT, () => {
 console.log("Server is running...");
});

// GET ALL CHARACTERS
app.get("/v1", async(req, res) => {
    const thumbnails = [];
    const limit = Number.parseInt(req.query.limit); 
    try {
        const {data} = await axios.get("https://kimetsu-no-yaiba.fandom.com/wiki/Kimetsu_no_Yaiba_Wiki");
        const $ = cheerio.load(data);
        $(".portal", data).each(function() {
            const name = $(this).find("a").attr("title");
            const url = $(this).find("a").attr("href");
            const image = $(this).find("a > img").attr("data-src");
            thumbnails.push({
                name: name,
                url: "https://demon-slayer-api-0xrw.onrender.com/v1" + url.split("/wiki")[1],
                image: image
            })
        })
        if(limit && limit > 0){
            res.status(200).json(thumbnails.slice(0, 3));
        }
        else {
            res.status(200).json(thumbnails);
        }
    } catch (error) {
        res.status(500).send.json(error);
    }
});

//GET A CHARACTER
app.get("/v1/:character", async(req, res) => {
    const titles = [];
    const details = [];
    const characterObject = {};
    try {
        const {data} = await axios.get("https://kimetsu-no-yaiba.fandom.com/wiki/" + req.params.character);
        const $ = cheerio.load(data);
        $("aside", data).each(function(){
            const image = $(this).find("img").attr("src");
            if(image) characterObject.image = image;
            $(this).find("section > div > h3").each(function(){
                titles.push($(this).text());
            });
            $(this).find("section > div > div").each(function(){
                details.push($(this).text());
            }); 
        })
        for(let i = 0; i < titles.length; i++) {
            characterObject[titles[i].toLowerCase()] = details[i];
        }
        characterObject.gallery = [];
        $(".wikia-gallery-item", data).each(function() {
            characterObject.gallery.push($(this).find("a > img").attr("data-src"));
        })
        res.status(200).json({name: req.params.character.replace("_"," "), ...characterObject});
    } catch (error) {
        res.status(500).json(error);
    }
});