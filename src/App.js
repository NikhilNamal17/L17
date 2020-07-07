import React, { useState } from 'react';
import './styles.css';
// import glove from "./assets/glove.png"

function App() {

  const [url, setUrl] = useState("")
  const [slug, setSlug] = useState("")
  const [resUrl, setResUrl] = useState("")
  const [formVisible, setFormVisible] = useState(true)


  const onSubmit = async e => {
    e.preventDefault();


    try {
      const response = await fetch('https://l17.herokuapp.com/url', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          slug: slug || undefined,
        }),
      });


      if (response.ok) {
        const result = await response.json();
        console.log(result)
        setFormVisible(false)
        setResUrl(`https://l17.herokuapp.com/${result.slug}`);
        console.log(resUrl)
      }
    } catch (err) {
      console.log(err)
    }
  }


  return (
    <div>
      <div className="titan-background">
        <span className="stars stars-L"></span>
        <span className="stars stars-M"></span>
        <span className="stars stars-S"></span>
      </div>


      <div className="marvellous-container">
        <div className="header">
          <h1><span className="title-marvel">L</span> <span className="title-studios">17</span></h1>

        </div>



        {formVisible === true ? (<form className="form" onSubmit={onSubmit}>
          <label>

            <input className="input" name="url" id="url" placeholder="enter a url"
              type="text"
              value={url}
              onChange={e => {
                setUrl(e.target.value)
              }}
            />
          </label>
          <label>

            <input className="input"
              type="text"
              value={slug}
              onChange={e => {
                setSlug(e.target.value)
              }}
              name="slug" id="slug" placeholder="enter an alias(optional)"
            />
          </label>
          <input type="submit" value="Create" className="create" />
        </form>) : null

        }

        {resUrl ? (
          <p className="created"> Your short url: <a href={resUrl} >{resUrl}</a>
          </p>
        ) : null}




        {/* <div className="footer">
          <img src={glove} alt="thanos gauntlet but its like the classNameic emoji hands with an awful photoshop of stupid gems on it, because funny" />

        </div> */}
      </div>
    </div>
  );
}

export default App;
