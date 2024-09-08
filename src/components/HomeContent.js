import React, { useState, useEffect } from "react";
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import SideBar from "./sidebar/Side";
import Content from "./content/Content";
import { BrowserRouter as Router, Link } from "react-router-dom";
import "./page.css"; 
import "./Home.css"; 
import { useNavigate} from "react-router-dom";
import user from "../user.png";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import classNames from "classnames";
import userImg from "../user.png";
import { formatDistanceToNow } from "date-fns";

function HomeContent({isOpen}){
  const [questions, setQuestions] = useState([]);
  const [notes, setNotes] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [usernamesq, setUsernamesq] = useState({});
  const [answer_count, setAnswer_count] = useState({});
  const [questionTags, setQuestionTags] = useState({});
  

  const fetchTags = async (questionId) => {
    console.log(questionId);
    const response = await fetch(
      `http://localhost:8081/api/tags/${questionId}`
    );
    const data = await response.text(); // Change to text to inspect the raw response
    console.log(data); // This will help you see if the response is HTML or JSON

    const tags = JSON.parse(data); // Convert to JSON if the response is correct
    setQuestionTags((prevState) => ({
      ...prevState,
      [questionId]: tags,
    }));

  };

  const fetchAnswerCount = async (questionId) => {
    try {
        const response = await fetch(`http://localhost:8081/api/answers/count/${questionId}`);
        const { answer_count } = await response.json();
        setAnswer_count((prev) => ({
          ...prev,
          [questionId]: answer_count,
        }))
    } catch (error) {
        console.error('Error fetching answer count:', error);
    }
};

  const decodePdfUrl = (pdf_url) => {
    let pdfUrlString = '';
    if (pdf_url && pdf_url.type === 'Buffer') {
      pdfUrlString = new TextDecoder().decode(new Uint8Array(pdf_url.data));
    } else {
      pdfUrlString = pdf_url;
    }
    return pdfUrlString;
  };

  const [user, setUser] = useState({
    name: "",
    email: "",
  });
  
  useEffect(() => {
    axios
      .get("http://localhost:8081/userInfo")
      .then((res) => {
        setUser(res.data);
      })
      .catch((error) => console.error("Error fetching questions:", error));
    console.log("N");
  }, []);

  useEffect(() => {
    axios.get("http://localhost:8081/top-questions")
      .then(response => {
        setQuestions(response.data);
        response.data.forEach((q) => {
          fetchTags(q.id);
          fetchAnswerCount(q.id);
          get_userNameq(q.author_id)
        })
      })
      .catch(error => console.error("Error fetching top questions:", error));
  }, []);   

  useEffect(() => {
    axios
      .get("http://localhost:8081/top-notes")
      .then((response) => {
        setNotes(response.data);
        response.data.forEach((note) => {
          get_userName(note.author_id);
        });
      })
      .catch((error) => console.error("Error fetching notes:", error));
  }, []);


  const get_userName = async (id) => {
    try {
      const res = await axios.post("http://localhost:8081/username", { id });
      setUsernames((prevUsernames) => ({
        ...prevUsernames,
        [id]: res.data,
      }));
      console.log(res.data);
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  };
  const get_userNameq = async (id) => {
    try {
      const res = await axios.post("http://localhost:8081/username", { id });
      setUsernamesq((prevUsernames) => ({
        ...prevUsernames,
        [id]: res.data,
      }));
      console.log(res.data);
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  };

  const checkRating =(rating) =>{
    if(rating === null){
      return 0;
    }

    return rating;
  }

  
  const navigate = useNavigate();
  const User = "User"
  const currUserName = (user) => {
    if(user[0] !== undefined){
      console.log(user[0].name)
      return user[0].name;
    }else{
      console.log("user")
      return User;
    }
  }
        return (

      <main class="main-content">
      
      <div className="welcome">
        <h1 className="welcomeuser">
          Welcome, {currUserName(user)}
        </h1>
        <span className="jump">Jump back in, or post something new!</span>
      </div>
      <hr/>
      <div className="homeContainer">
        <div className="allhome">
      <div className="topBar">
        <h2 id="topQuestions">Today's Burning Questions </h2>
      </div>
        <div className="topQue">
        <ul>
        {/* <hr className="homeline"/> */}
          {questions.map((question) => (
            <>
            <li
              className="questionHome"
              /*onClick={() => handelQueClick(question)}*/ key={question.id}
            >
              {/*{question.title}, {question.content}*/}
              {/* Question display */}
              <Link to={`/question/${question.id}`} state={{ question }}>

              
                <div class="centered-boxHome">
                  <div className="boxinbox">
                    <div className="questionHeadingHome">
                      <h3>
                        {question.title.length > 121
                          ? question.title.substring(0, 121) + "..."
                          : question.title}
                      </h3>
                    </div>

                    <div className="other">
                      {/* <div id="views">100 views</div> */}
                      <div id="votes">{question.rating} votes</div>
                      <div id="answers">{answer_count[question.id]} answers</div>
                    </div>
                  </div>
                  <div className="hometagsnuser">
                  <div id="quetags">
                        {questionTags[question.id] ? (
                          questionTags[question.id].slice(0, 3).map((tag) => (
                            <span key={tag.tag_id} id="quetagresult">
                              {tag.tag_name}
                            </span>
                          ))
                        ) : (
                          <p>loading tags ... </p>
                        )}
                      </div>
                    <div className="user">
                      <div>
                        <img src={userImg} className="user-image" />
                      </div>
                      <div className="name">{usernamesq[question.author_id] || "Loading..."}</div>
                    </div>
                    <div className="time">{formatDistanceToNow(new Date(question?.created_at || '2024-06-30T17:16:25'), {
                    addSuffix: true,
                  })}</div>
                  </div>
                </div>
                
              </Link>
            </li>
            {/* <hr className="homeline"/> */}
            </>
          ))}
        </ul>
        </div>
        <div className="topNoteBar">
          <h2 id="topQuestions">Let's, dive into the Notes </h2>
        </div>
        <ol className="notelist">
        {notes.map((note) => (
          <li className="note" key={note.id}>
            <Link to={`/note/${note.id}`} state={{ note }}>
              <div className="homenote-card">
                <div className="cardincard">
                <div className="pdfCover"></div>
                  <div className="pdf-preview">
                    {note.pdf ? (
                        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                          <Viewer fileUrl={decodePdfUrl(note.pdf)} style={{ width: '100%', height: '100%' }} defaultScale={0.421}>
                            <div>Loading PDF...</div>
                          </Viewer>
                        </Worker>
                        // <iframe
                        //   src={`${decodePdfUrl(note.pdf)}#page=0`}
                        //   width="200"
                        //   height="300"
                        //   title="PDF Preview"
                        // />
                        // <iframe
                        //   id="pdf-iframe"
                        //   src={decodePdfUrl(note.pdf)}
                        //   width="200"
                        //   height="300"
                        //   title="PDF Preview"
                        //   onLoad={() => renderFirstPage(decodePdfUrl(note.pdf))}
                        // />
                      ) : (
                        <div>Loading...</div>
                      )}
                  </div>
                  <div className="hideScroll"></div>

                </div>
                  <div className="hideScrollX"></div>
                <div className="noteuserContainer">
                  <div className="noteuser">
                    <div className="noteuserImgContainer">
                      <img src={userImg} className="nuser-image" />
                    </div>
                  </div>
                  <div className="noteInfo">
                    <h5 className="noteHead">{note.course_name}</h5>
                    <h6 className="writer">
                      {usernames[note.author_id] || "Loading..."}
                    </h6>
                    <div className="likesntime">
                      <div className="noteLikes">{checkRating(note.rating)} Votes</div>
                      <div className="dot">•</div>
                      <div className="notetime">
                        {formatDistanceToNow(new Date(note.created_at), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
        </div>
        <div className="thingstodo">
          <h5 id="headthingstodo">Things To Do...</h5>
          <div className="searchBox">
            <h4 className="boxh4s">Search Everything</h4>
            <p className="boxhps">Find exactly what you need! <br/>Use our search tool to explore questions, notes, answers, and tags all in one place.</p>
            <div className="forbutton"><a href="/search"><button className="boxbuttons">Search</button></a></div>
          </div>
          <div className="searchBox">
            <h4 className="boxh4s">Ask a Question</h4>
            <p className="boxhps">Got a burning question? <br/>Post it here and let the Brainlink community help you find the answer!
            </p>
            <div className="forbutton"><a href="/ask"><button className="boxbuttons">Ask a Question</button></a></div>
          </div>
          <div className="searchBox">
            <h4 className="boxh4s">Answer Questions</h4>
            <p className="boxhps">Share your knowledge! <br/>Browse through questions and provide your answers to help others.
            </p>
            <div className="forbutton"><a href="/questions"><button className="boxbuttons">Browse Questions</button></a></div>
          </div>
          <div className="searchBox">
            <h4 className="boxh4s">Explore Notes</h4>
            <p className="boxhps">Discover notes shared by the community. Dive into various topics and learn from others.
            </p>
            <div className="forbutton"><a href="/notes"><button className="boxbuttons">Dive in Notes</button></a></div>
          </div>
          <div className="searchBox">
            <h4 className="boxh4s">Share Notes</h4>
            <p className="boxhps">Have insights to share? <br/>Create notes and contribute your knowledge to the Brainlink community.
            </p>
            <div className="forbutton"><a href="/addnote"><button className="boxbuttons">Uplode Notes</button></a></div>
          </div>
          <div className="searchBox">
            <h4 className="boxh4s">Tag Your Content</h4>
            <p className="boxhps">Share your knowledge! <br/>Make your questions and notes easier to find by adding relevant tags.
            </p>
            <div className="forbutton"><a href="/alltags"><button className="boxbuttons">Explore Tags</button></a></div>

          </div>
          <div className="searchBox">
            <h4 className="boxh4s">Chat with Your Notes</h4>
            <p className="boxhps">Interact with your notes directly in Brainlink. Ask questions, get insights, and engage deeply with your study material. 
            </p>
            <div className="forbutton"><a href="/notes"><button className="boxbuttons">Explore Now</button></a></div>

          </div>
          <div className="searchBox">
            <h4 className="boxh4s">Profile </h4>
            <p className="boxhps">View your contributions, and manage your profile
            </p>
            <div className="forbutton"><a href="/you"><button className="boxbuttons">Profile</button></a></div>
          </div>
        </div>
      </div>
      <hr/>
      <div className="news">
        <h4 id="newtotell">New from Brainlink</h4>
        <div className="anotherhomebox">
        <h3 className="newsh3">Chat with notes!</h3>
        <p className="boxhps">We are excited to introduce the 'Chat with Notes' feature on Brainlink! Now, you can interact directly with the notes in the Brainlink note section, enhancing your productivity and learning experience. Start chatting with the notes today and make the most of your Brainlink experience!</p>
        <div className="forbutton"><a href="/notes"><button className="boxbuttons">Explore Now!</button></a></div>
        
        </div>
        <div className="anotherhomebox">
        <h3 className="newsh3">Tags!</h3>
        <p className="boxhps">We're excited to introduce tags on Brainlink! Now you can easily add tags to your questions, making them more discoverable. <br/>Not only that, but you can also search by tags to find related questions and notes quickly. Start tagging and enhance your Brainlink experience today!</p>
        <div className="forbutton"><a href="/alltags"><button className="boxbuttons">Explore Tags!</button></a></div>
        
        </div>
      </div>
    </main>

        );
}
export default HomeContent;

