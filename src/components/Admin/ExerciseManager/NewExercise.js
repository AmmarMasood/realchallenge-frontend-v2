import React, { useState, useEffect, useContext } from "react";
import { Form, Input, Button, Select, Card, Tag } from "antd";
import RemoteMediaManager from "../MediaManager/RemoteMediaManager";
import {
  createExercise,
  getAllUserExercises,
} from "../../../services/createChallenge/main";
import { getAllTrainers } from "../../../services/trainers";
import { userInfoContext } from "../../../contexts/UserStore";
import LanguageSelector from "../../LanguageSelector/LanguageSelector";
import { LanguageContext } from "../../../contexts/LanguageContext";
import {
  getOppositeLanguage,
  getLanguageLabel,
  getLanguageFlag,
  getOtherLanguages,
} from "../../../config/languages";
import { getTranslationsByKey } from "../../../services/translations";
import { T } from "../../Translate";
import { get } from "lodash";

const { Option } = Select;

function NewExercise({ setCurrentSelection, home }) {
  const [form] = Form.useForm();
  // media manager stuff
  const [mediaManagerVisible, setMediaManagerVisible] = useState(false);
  const [mediaManagerType, setMediaManagerType] = useState("images");
  const [mediaManagerActions, setMediaManagerActions] = useState([]);
  const [trainer, setTrainer] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [voiceOverLink, setVoiceOverLink] = useState("");
  const [allTrainers, setAllTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const [oppositeLanguageExercises, setOppositeLanguageExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [translatingFrom, setTranslatingFrom] = useState(null);
  const [translationKey, setTranslationKey] = useState(null);
  const [existingTranslations, setExistingTranslations] = useState({});
  const userInfo = useContext(userInfoContext)[0];
  const { language, strings } = useContext(LanguageContext);

  useEffect(() => {
    if (userInfo.role === "trainer") {
      setTrainer(userInfo.id);
    }
    // Reset translation state when language changes
    setTranslatingFrom(null);
    setTranslationKey(null);
    setExistingTranslations({});
    setSelectedExercise(null);
    form.resetFields();
    setVideoLink("");
    setVoiceOverLink("");
    fetchData();
  }, [language]);

  const fetchData = async () => {
    const res = await getAllTrainers();
    if (res) {
      setAllTrainers(res.trainers);
      setFilteredTrainers(res.trainers);
    }

    // Fetch exercises in opposite language for linking/translating
    const oppositeLanguage = getOppositeLanguage(language);
    const exercisesRes = await getAllUserExercises(oppositeLanguage, true);
    if (exercisesRes && exercisesRes.exercises) {
      setOppositeLanguageExercises(exercisesRes.exercises);
    }
  };

  // Handle selecting an exercise to translate from
  const handleTranslateFrom = async (exerciseId) => {
    if (!exerciseId) {
      setTranslatingFrom(null);
      setTranslationKey(null);
      setExistingTranslations({});
      setSelectedExercise(null);
      form.resetFields();
      setVideoLink("");
      setVoiceOverLink("");
      return;
    }

    const exercise = oppositeLanguageExercises.find((e) => e._id === exerciseId);
    if (exercise) {
      setTranslatingFrom(exercise);
      setSelectedExercise(exerciseId);

      // Pre-fill form with translatable content (but keep title empty for translation)
      form.setFieldsValue({
        title: "", // User needs to translate the title
        description: "", // User needs to translate the description
      });

      // Set trainer (same trainer for translations)
      if (exercise.trainer) {
        setTrainer(
          typeof exercise.trainer === "object"
            ? exercise.trainer._id
            : exercise.trainer
        );
      }

      // Copy video and voiceover links (media can be shared)
      if (exercise.videoURL) {
        setVideoLink({ link: exercise.videoURL, name: "Video from original" });
      }
      if (exercise.voiceOverLink) {
        setVoiceOverLink({
          link: exercise.voiceOverLink,
          name: "Voiceover from original",
        });
      }

      // If the original has a translation key, use it and fetch existing translations
      if (exercise.translationKey) {
        setTranslationKey(exercise.translationKey);
        const translationsData = await getTranslationsByKey(
          exercise.translationKey
        );
        if (translationsData) {
          setExistingTranslations(translationsData.translations || {});
        }
      }
    }
  };

  const onFinish = async (values) => {
    console.log(values, trainer);
    if (videoLink && trainer) {
      console.log(values);
      const data = {
        videoURL: videoLink.link,
        voiceOverLink: voiceOverLink?.link || "",
        trainer,
        language,
        // alternativeLanguage removed - using translationKey for multi-language support
        translationKey: translationKey || null, // Include translation key if translating
        ...values,
      };
      const res = await createExercise(data);
      setCurrentSelection(home);
      console.log("values", res);
    } else {
      alert(get(strings, "admin.please_add_video_and_trainer", "Please add a video link and trainer of a exercise"));
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const oppositeLanguage = getOppositeLanguage(language);

  return (
    <>
      <RemoteMediaManager
        visible={mediaManagerVisible}
        setVisible={setMediaManagerVisible}
        type={mediaManagerType}
        actions={mediaManagerActions}
      />
      <h2 className="font-heading-black"><T>admin.new_exercise</T></h2>
      <div
        className="admin-newuser-container"
        style={{ padding: "50px 50px 50px 20px" }}
      >
        <div style={{ marginBottom: "20px" }}>
          <span><T>admin.select_language</T>: </span>
          <LanguageSelector notFromNav={true} />
        </div>

        {/* Translate from existing exercise option */}
        <Card
          size="small"
          title={get(strings, "admin.translate_from_exercise", `Translate from ${getLanguageLabel(oppositeLanguage)} Exercise`)}
          style={{ marginBottom: "20px" }}
        >
          <Select
            allowClear
            showSearch
            style={{ width: "100%" }}
            placeholder={get(strings, "admin.select_exercise_to_translate", `Select a ${getLanguageLabel(oppositeLanguage)} exercise to translate`)}
            value={translatingFrom?._id}
            onChange={handleTranslateFrom}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {oppositeLanguageExercises.map((exercise) => (
              <Option key={exercise._id} value={exercise._id}>
                {exercise.title}
              </Option>
            ))}
          </Select>

          {translatingFrom && (
            <div style={{ marginTop: "15px" }}>
              <div style={{ marginBottom: "10px" }}>
                <strong><T>admin.original_exercise</T>:</strong>
              </div>
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "10px",
                  borderRadius: "4px",
                }}
              >
                <p>
                  <strong><T>admin.title</T>:</strong> {translatingFrom.title}
                </p>
                {translatingFrom.description && (
                  <p>
                    <strong><T>admin.description</T>:</strong> {translatingFrom.description}
                  </p>
                )}
                {translatingFrom.trainer && (
                  <p>
                    <strong><T>admin.trainer</T>:</strong>{" "}
                    {typeof translatingFrom.trainer === "object"
                      ? `${translatingFrom.trainer.firstName} ${translatingFrom.trainer.lastName}`
                      : translatingFrom.trainer}
                  </p>
                )}
              </div>

              {/* Show existing translations */}
              {Object.keys(existingTranslations).length > 0 && (
                <div style={{ marginTop: "10px" }}>
                  <strong><T>admin.existing_translations</T>:</strong>
                  <div style={{ marginTop: "5px" }}>
                    {Object.entries(existingTranslations).map(
                      ([lang, content]) =>
                        content && (
                          <Tag key={lang} color="blue">
                            {getLanguageFlag(lang)} {getLanguageLabel(lang)}
                          </Tag>
                        )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        <Form
          form={form}
          layout="vertical"
          name="basic"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label={
              translatingFrom
                ? get(strings, "admin.exercise_title_translation", `Exercise Title (${getLanguageLabel(language)} Translation)`)
                : get(strings, "admin.exercise_title", "Exercise Title")
            }
            name="title"
            rules={[
              { required: true, message: get(strings, "admin.please_input_exercise_title", "Please input exercise title!") },
            ]}
          >
            <Input
              placeholder={
                translatingFrom
                  ? get(strings, "admin.translate_placeholder", `Translate: "${translatingFrom.title}"`)
                  : get(strings, "admin.enter_exercise_title", "Enter exercise title")
              }
            />
          </Form.Item>
          <Form.Item label={<T>admin.exercise_video</T>} required="true">
            <Button
              onClick={() => {
                setMediaManagerVisible(true);
                setMediaManagerType("videos");
                setMediaManagerActions([videoLink, setVideoLink]);
              }}
            >
              <T>admin.upload_video</T>
            </Button>
            <div
              className="font-paragraph-white"
              style={{ color: "#ff7700", margin: "5px 0" }}
            >
              {videoLink && videoLink.name}
            </div>
          </Form.Item>
          <Form.Item
            label={
              translatingFrom
                ? get(strings, "admin.exercise_description_translation_optional", `Exercise Description (${getLanguageLabel(language)} Translation - Optional)`)
                : get(strings, "admin.exercise_description_optional", "Exercise Description (Optional)")
            }
            name="description"
          >
            <Input
              placeholder={
                translatingFrom && translatingFrom.description
                  ? get(strings, "admin.translate_description_placeholder", `Translate: "${translatingFrom.description}"`)
                  : get(strings, "admin.enter_exercise_description", "Enter exercise description")
              }
            />
          </Form.Item>
          <Form.Item label={<T>admin.trainer</T>} required="true">
            <Select
              allowClear
              style={{ width: "100%" }}
              placeholder={get(strings, "admin.please_select", "Please select")}
              value={trainer}
              disabled={userInfo.role === "trainer" || translatingFrom}
              onChange={(e) => setTrainer(e)}
              filterOption={false}
              onSearch={(e) => {
                const t = allTrainers.filter((f) =>
                  f.firstName
                    .concat(f.lastName)
                    ?.toLowerCase()
                    .includes(e.toLowerCase())
                );
                setFilteredTrainers(t);
              }}
            >
              {filteredTrainers.map((trainer) => (
                <Option key={trainer._id} value={trainer._id}>
                  {trainer.firstName} {trainer.lastName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label={get(strings, "admin.voiceover_link_optional", "Voiceover Link (Optional)")}>
            <Button
              onClick={() => {
                setMediaManagerVisible(true);
                setMediaManagerType("voiceOvers");
                setMediaManagerActions([voiceOverLink, setVoiceOverLink]);
              }}
            >
              <T>admin.upload_voiceover</T>
            </Button>
            <div
              className="font-paragraph-white"
              style={{ color: "#ff7700", margin: "5px 0" }}
            >
              {voiceOverLink && voiceOverLink.name}
            </div>
          </Form.Item>

          {/* Show link info when translating */}
          {translatingFrom && (
            <div
              style={{
                padding: "10px",
                background: "#e6f7ff",
                borderRadius: "4px",
                marginBottom: "15px",
              }}
            >
              <span>
                {get(strings, "admin.exercise_will_be_linked", `This exercise will be linked as the ${getLanguageLabel(language)} translation of "${translatingFrom.title}"`)}
              </span>
            </div>
          )}

          {/* footer */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                backgroundColor: "var(--color-orange)",
                borderColor: "var(--color-orange)",
                marginTop: "10px",
              }}
            >
              {translatingFrom ? <T>admin.create_translation</T> : <T>admin.create_exercise</T>}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
}

export default NewExercise;
