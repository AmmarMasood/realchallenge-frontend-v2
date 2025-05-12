import React, { useState, useEffect, useContext } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Input, Tag, Card } from "antd";

import "../assets/helpcenter.css";

import { getAllFaqCategories, getAllFaqs } from "../services/faqs";
import { includes } from "lodash";
import { T } from "../components/Translate";
import { LanguageContext } from "../contexts/LanguageContext";
const { CheckableTag } = Tag;

function HelpCenter() {
  const { language } = useContext(LanguageContext);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [filteredQuestion, setFilteredQuestions] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    fetchData();
  }, [language]);

  useEffect(() => {
    const nC =
      selectedCategory.length > 0
        ? questions.filter((q) =>
            q.category.some((item) => selectedCategory.includes(item))
          )
        : questions;
    setFilteredQuestions(nC);
  }, [selectedCategory, questions]);

  const fetchData = async () => {
    const f = await getAllFaqs(language);
    const c = await getAllFaqCategories(language);

    if (c) {
      setAllCategories(c.categories);
    }
    if (f) {
      console.log(f.faqs);
      setQuestions(f.faqs);
      setFilteredQuestions(f.faqs);
    }
    // console.log(f, c);
  };
  const onChange = (e) => {
    console.log(e);
  };

  const handleCategory = (tag, checked) => {
    console.log(tag, checked);
    const nextSelectedTags = checked
      ? [...selectedCategory, tag._id]
      : selectedCategory.filter((t) => t !== tag._id);
    setSelectedCategory(nextSelectedTags);
  };
  return (
    <>
      <Navbar />
      <div className="helpcenter-container">
        <div className="helpcenter-top">
          <div className="helpcenter-top-con">
            <h1 className="font-heading-white">
              <T>helpcenter.howcan</T>
            </h1>
            <Input
              placeholder="Type keyword"
              className="font-paragraph-white"
              style={{
                padding: "15px",
              }}
              width="100%"
              allowClear
              onChange={onChange}
            />
            <div style={{ marginTop: "20px" }}>
              <h3 className="font-paragraph-white">
                <T>helpcenter.sc</T>
              </h3>
              <div style={{ paddingTop: "10px" }}>
                {allCategories.map((tag) => (
                  <CheckableTag
                    style={{ color: "white", fontSize: "14px" }}
                    key={tag._id}
                    checked={selectedCategory.includes(tag._id)}
                    onChange={(checked) => handleCategory(tag, checked)}
                  >
                    {tag.name}
                  </CheckableTag>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="helpcenter-questions-container">
          {filteredQuestion.map((q) => (
            <Card className="helpcenter-questions-container-card" key={q._id}>
              <h1 className="font-subheading-black">{q.question}</h1>
              <p className="font-paragraph-black" style={{ fontSize: "15px" }}>
                {q.answer}
              </p>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default HelpCenter;
