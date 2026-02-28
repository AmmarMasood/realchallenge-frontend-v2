import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import "../../../../assets/trainerprofile.css";
import "../../../../assets/home.css";
import "../../../../assets/challengeProfile.css";
import Navbar from "../../../../components/Navbar";
import {
  LoadingOutlined,
  DeleteFilled,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { withRouter, Link } from "react-router-dom";
import {
  Tooltip,
  Select,
  Modal,
  Input,
  Button,
  List,
  Collapse,
  Checkbox,
  notification,
  Alert,
  message,
  Radio,
} from "antd";

import { userInfoContext } from "../../../../contexts/UserStore";
import { selectedChallengeContext } from "../../../../contexts/PaymentProcessStore";
import { getUserProfileInfo } from "../../../../services/users";
import HelpIcon from "../../../../assets/icons/Help-icon.png";
import ChallengeProfileSubtract from "../../../../assets/icons/challenge-profile-subtract.svg";
import { T } from "../../../../components/Translate";
import { LanguageContext } from "../../../../contexts/LanguageContext";
import { get } from "lodash";
import { usePackageConfig } from "../../../../contexts/PackageConfigContext";
import "../../../../assets/adminDashboardV2.css";
import RemoteMediaManager from "../../MediaManager/RemoteMediaManager";
import PopupPlayer from "../../../PopupPlayer/PopupPlayer";
import AddNewButton from "./AddNewButton";
import {
  createBodyFocus,
  deleteChallengeBodyfocus,
  getAllBodyFocus,
} from "../../../../services/createChallenge/bodyFocus";
import { getAllChallengeGoals } from "../../../../services/createChallenge/goals";
import {
  createTrainerGoal,
  deleteTrainerGoals,
  getAllTrainerGoals,
  getAllTrainers,
} from "../../../../services/trainers";
import { getAllChallengeTags } from "../../../../services/createChallenge/tags";
import EditTypeName from "../../ChallengeManager/EditTypeName";
import slug from "elegant-slug";
import WorkoutStudioIcon from "../../../../assets/icons/workout-studio.svg";
import { useChallenge } from "../../../../contexts/ChallengeCreatorV2";
import { v4 } from "uuid";
import {
  createChallenge,
  createWorkout,
  getAllExercises,
  getAllUserExercises,
  getChallengeById,
  updateChallenge,
  updateWorkoutOnBackend,
  getAllUserChallenges,
  getIntensityGroups,
} from "../../../../services/createChallenge/main";
import { useBrowserEvents } from "../../../../helpers/useBrowserEvents";
import { hasAnyRole } from "../../../../helpers/roleHelpers";
import setAuthToken from "../../../../helpers/setAuthToken";
import DragAndDropIcon from "../../../../assets/icons/drag-drop.svg";
import CopyIcon from "../../../../assets/icons/copy-icon.svg";
import ShareIcon from "../../../../assets/icons/share-icon.svg";
import FavIcon from "../../../../assets/icons/add-to-fav-icon.svg";
import DeleteIcon from "../../../../assets/icons/delete_icon.svg";
import DeleteWhite from "../../../../assets/icons/delete-icon-white.svg";
import CopyIconWhite from "../../../../assets/icons/copy-icon-white.svg";
import DragAndDropIconWhite from "../../../../assets/icons/drag-drop-icon-white.svg";
import {
  DraggableArea,
  DraggableItem,
  DraggableHandle,
  ItemTypeWeek,
  ItemTypeWorkout,
} from "../../../../helpers/DndWrapper.jsx";
import { debounce } from "lodash";
import { createPost } from "../../../../services/posts.js";
import { getDefaultGoals } from "../../../../constants/goals.js";

// tooltipText is resolved inside the component via strings
const iconStyle = {
  cursor: "pointer",
  height: "20px",
  width: "20px",
};

function BasicInformation(props) {
  const { language, updateLanguage, strings } = useContext(LanguageContext);
  const { getPackage } = usePackageConfig();
  const tooltipText = get(strings, "payment.tooltip_no_plan", "If you don't choose any plan and hit start now, you can go through the wizard, get your free intake, make a free account and enjoy our free challenges collection and one week meal plan.");
  const [userInfo, setUserInfo] = useContext(userInfoContext);
  const [isUpdate, setIsUpdate] = useState(false);
  const {
    showVideoCreator,
    setShowVideoCreator,
    usereDtails,
    setUserDetails,
    loading,
    setLoading,
    thumbnail,
    setThumbnail,
    videoThumbnail,
    setVideoThumbnail,
    challengeName,
    setChallengeName,
    challengeDescription,
    setChallengeDescription,
    difficulty,
    setDifficulty,
    duration,
    setDuration,
    openPopupPlayer,
    setOpenPopupPlayer,
    pack,
    setPack,
    customPrice,
    setCustomPrice,
    challengeInfo,
    setChallengeInfo,
    result,
    setResult,
    selectedFitnessInterest,
    setSelectedFitnessInterest,
    selectedBodyFocus,
    setSelectedBodyFocus,
    selectedGoals,
    setSelectedGoals,
    seletedTrainers,
    setSelectedTrainers,
    allTrainers,
    setAllTrainers,
    allFitnessInterests,
    setAllFitnessInterests,
    allBodyFocus,
    setAllBodyFocus,
    showChangePanel,
    setShowChangePanel,
    allGoals,
    setAllGoals,
    weeks,
    setWeeks,
    musics,
    setMusics,
    selectedWorkoutForStudioId,
    setSelectedWorkoutForStudioId,
    allExercises,
    setAllExercises,
    populateChallengeInfo,
    isFirstRender,
    setIsFirstRender,
    points,
    setPoints,
    multipleIntensities,
    setMultipleIntensities,
    intensityGroupId,
    setIntensityGroupId,
    intensity,
    setIntensity,
    isGroupHead,
    groupHeadName,
  } = useChallenge();
  const [dataLoaded, setDataLoaded] = useState(false); // Track when all setters are done

  // media manager
  const [mediaManagerVisible, setMediaManagerVisible] = useState(false);
  const [mediaManagerType, setMediaManagerType] = useState("images");
  const [mediaManagerActions, setMediaManagerActions] = useState([]);
  // update
  const [editItemNameModalVisible, setEditItemNameModalVisible] =
    useState(false);
  const [selectedItemForUpdate, setSelectedItemForUpdate] = useState({});
  const [selectedItemForUpdateTitle, setSelectedItemForUpdateTitle] =
    useState("");
  // manage
  const [fitnessInterestModal, setFitnessInterestModal] = useState(false);
  const [newTrainerFitnessInterest, setNewTrainerFitnessInterest] =
    useState("");
  const [bodyFocusModal, setBodyfocusModal] = useState(false);
  const [newBodyFocus, setNewBodyFocus] = useState("");
  const [goalsModal, setGoalsModal] = useState(false);
  const [trainerModal, setTrainerModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [allowComments, setAllowComments] = useState(true);
  const [allowReviews, setAllowReviews] = useState(true);
  const [makePublic, setMakePublic] = useState(true);
  const [adminApproved, setAdminApproved] = useState(false);
  const [userCreatePost, setUserCreatePost] = useState(false);
  const [isDraggingWorkout, setIsDraggingWorkout] = useState(false);
  const [draggedWorkoutId, setDraggedWorkoutId] = useState(null);
  const [coverVideoLoading, setCoverVideoLoading] = useState(true);
  const [groupMode, setGroupMode] = useState("new"); // "new" | "existing"
  const [trainerGroups, setTrainerGroups] = useState([]);
  const [priceInheritedFromGroup, setPriceInheritedFromGroup] = useState(false);

  // Hide price/package for non-head group siblings
  const isNonHeadSibling =
    (isUpdate && intensityGroupId && !isGroupHead) || priceInheritedFromGroup;
  // Translation support - for linking challenges across languages
  const [allChallengesFromOtherLanguage, setAllChallengesFromOtherLanguage] =
    useState([]);
  const [selectedChallengeForTranslation, setSelectedChallengeForTranslation] =
    useState("");
  const [translationKey, setTranslationKey] = useState(null);
  const [translationDropdownOpen, setTranslationDropdownOpen] = useState(false);
  const [translationSearch, setTranslationSearch] = useState("");
  const translationDropdownRef = useRef(null);
  // Store the challenge's original language to prevent global language changes from affecting updates
  const [challengeLanguage, setChallengeLanguage] = useState(null);
  const { reloadWithoutConfirmation } = useBrowserEvents({
    enableBeforeUnloadConfirm: true,
    hasUnsavedChanges: true,
    backForwardMessage: get(
      strings,
      "challengeStudio.unsaved_changes_warning",
      "You have unsaved changes in this challenge. Are you sure you want to leave?",
    ),
    confirmMessage: get(
      strings,
      "challengeStudio.unsaved_work_lost",
      "Any unsaved work will be lost. Continue?",
    ),
    onPopState: (e) => {
      console.log("Navigation detected", e);
    },
    onBeforeUnload: () => {
      console.log("Page is about to unload");
    },
    onPageHide: (e) => {
      console.log("Page hidden, persisted:", e.persisted);
    },
    onVisibilityChange: (state) => {
      console.log("Tab visibility changed:", state);
    },
  });

  const fetchDataV2 = async (effectiveLanguage) => {
    // Set auth token before making API calls
    setAuthToken(localStorage.getItem("jwtToken"));
    setLoading(true);
    let currentUserDetails = null;
    // Use the effective language (challenge's language for updates, global language for new)
    const langToUse = effectiveLanguage || language;

    // Get user info for both trainer and admin
    if (userInfo.role === "trainer" || userInfo.role === "admin") {
      const uInfo = await getUserProfileInfo(userInfo.id);
      currentUserDetails = uInfo.customer;
      // Only auto-add trainer, not admin
      if (userInfo.role === "trainer") {
        uInfo &&
          seletedTrainers.length <= 0 &&
          setSelectedTrainers((prev) => [...prev, uInfo.customer]);
      }
      setUserDetails(uInfo.customer);
    }
    const bodyFocus = await getAllBodyFocus(langToUse);
    const trainers = await getAllTrainers(langToUse);
    const res = await getAllTrainerGoals(langToUse);
    const allExercises = await getAllExercises(langToUse);
    const challengeGoals = await getAllChallengeGoals(langToUse);
    setAllBodyFocus(bodyFocus.body);
    setAllGoals(
      challengeGoals?.challengeGoals?.length > 0
        ? challengeGoals.challengeGoals
        : getDefaultGoals(),
    );

    // If user is admin, ensure they appear in the trainers list
    let trainersList = trainers.trainers || [];
    if (userInfo.role === "admin" && currentUserDetails) {
      const adminExists = trainersList.find(
        (t) => t._id === currentUserDetails._id,
      );
      if (!adminExists) {
        trainersList = [...trainersList, currentUserDetails];
      }
    }
    setAllTrainers(trainersList);

    setAllFitnessInterests(res.goals);
    setAllExercises(allExercises.exercises);

    // Fetch challenges from other language for translation linking
    const otherLanguage = langToUse === "dutch" ? "english" : "dutch";
    const challengesFromOtherLang = await getAllUserChallenges(
      otherLanguage,
      true,
    );
    setAllChallengesFromOtherLanguage(
      challengesFromOtherLang?.challenges || [],
    );

    setDataLoaded(true); // Set dataLoaded to true after all setters are done

    setLoading(false);
  };

  // Set groupMode to "existing" if editing a challenge that already has a group
  useEffect(() => {
    if (intensityGroupId) {
      setGroupMode("existing");
    }
  }, [intensityGroupId]);

  // Fetch trainer groups when multipleIntensities is enabled
  useEffect(() => {
    if (multipleIntensities) {
      getIntensityGroups(seletedTrainers || []).then((res) => {
        setTrainerGroups(res.groups || []);
      });
    }
  }, [multipleIntensities, seletedTrainers]);

  // Handle selecting a challenge to translate
  const handleSelectChallengeForTranslation = (challengeId) => {
    setSelectedChallengeForTranslation(challengeId);
    if (challengeId) {
      const challenge = allChallengesFromOtherLanguage.find(
        (c) => c._id === challengeId,
      );
      if (challenge && challenge.translationKey) {
        setTranslationKey(challenge.translationKey);
      } else {
        setTranslationKey(null);
      }
    } else {
      setTranslationKey(null);
    }
  };

  useEffect(() => {
    console.log("isFirstRender", isFirstRender);
    // Call populateChallengeInfo only when data is loaded
    if (dataLoaded && props.match.params.challengeId) {
      setIsUpdate(true);
    }
    // Only fetch challenge once on initial load, not when global language changes
    if (dataLoaded && props.match.params.challengeId && !isFirstRender) {
      const fetchChallenge = async () => {
        setLoading(true);
        const challenge = await getChallengeById(
          props.match.params.challengeId,
        );

        // Authorization check
        const isAdmin = hasAnyRole(userInfo, ["admin"]);
        const isCreator =
          challenge.user === userInfo.id || challenge.user?._id === userInfo.id;
        const isAssignedTrainer = challenge.trainers?.some(
          (t) => (t._id || t) === userInfo.id,
        );

        if (!isAdmin && !isCreator && !isAssignedTrainer) {
          notification.error({
            message: "Not Authorized",
            description: "You don't have permission to edit this challenge.",
          });
          props.history.push("/admin/v2");
          return;
        }

        // Store the challenge's original language
        if (challenge && challenge.language) {
          setChallengeLanguage(challenge.language);
        }

        populateChallengeInfo(challenge);

        // Set additional states from challenge data
        if (challenge.allowComments !== undefined) {
          setAllowComments(challenge.allowComments);
        }
        if (challenge.allowReviews !== undefined) {
          setAllowReviews(challenge.allowReviews);
        }
        if (challenge.isPublic !== undefined) {
          setMakePublic(challenge.isPublic);
        }
        if (challenge.adminApproved !== undefined) {
          setAdminApproved(challenge.adminApproved);
        }

        setLoading(false);
        setIsFirstRender(true);
      };
      fetchChallenge();
    }
  }, [dataLoaded, props.match.params.challengeId]); // Removed language dependency

  useEffect(() => {
    if (userInfo) {
      // For updates, only fetch data once with the challenge's language
      // For new challenges, fetch data when global language changes
      if (props.match.params.challengeId) {
        // Update mode: only fetch once, use challenge's language
        if (!challengeLanguage) {
          // Initial load - will be called again after challengeLanguage is set
          fetchDataV2();
        }
      } else {
        // New challenge mode: respond to global language changes
        fetchDataV2();
      }
    }
  }, [userInfo, language, props.match.params.challengeId]);

  // Refetch data with correct language once challengeLanguage is set (for updates)
  useEffect(() => {
    if (challengeLanguage && props.match.params.challengeId && userInfo) {
      fetchDataV2(challengeLanguage);
    }
  }, [challengeLanguage]);

  // Pre-populate translation link when editing an existing challenge
  useEffect(() => {
    if (
      dataLoaded &&
      props.match.params.challengeId &&
      allChallengesFromOtherLanguage.length > 0
    ) {
      const fetchAndSetTranslation = async () => {
        const challenge = await getChallengeById(
          props.match.params.challengeId,
        );
        if (challenge?.translationKey) {
          setTranslationKey(challenge.translationKey);
          const linked = allChallengesFromOtherLanguage.find(
            (c) => c.translationKey === challenge.translationKey,
          );
          if (linked) {
            setSelectedChallengeForTranslation(linked._id);
          }
        }
      };
      fetchAndSetTranslation();
    }
  }, [dataLoaded, allChallengesFromOtherLanguage]);

  // Close translation dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        translationDropdownRef.current &&
        !translationDropdownRef.current.contains(e.target)
      ) {
        setTranslationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openForThumbnail = () => {
    setErrors((prev) => ({
      ...prev,
      thumbnail: "",
    }));
    setMediaManagerVisible(true);
    setMediaManagerType("coverMedia"); // Allow both images and videos
    setMediaManagerActions([thumbnail, setThumbnail]);
  };

  // Helper to check if a file is a video based on its extension
  const isVideoFile = (file) => {
    if (!file) return false;
    const link = typeof file === "string" ? file : file.link;
    if (!link) return false;
    const videoExtensions = [
      "m4v",
      "avi",
      "mpg",
      "mp4",
      "mov",
      "wmv",
      "flv",
      "webm",
      "mkv",
    ];
    const ext = link.split(".").pop()?.toLowerCase();
    return videoExtensions.includes(ext);
  };

  const openForTrailer = () => {
    setErrors((prev) => ({
      ...prev,
      videoThumbnail: "",
    }));
    setMediaManagerVisible(true);
    setMediaManagerType("videos");
    setMediaManagerActions([videoThumbnail, setVideoThumbnail]);
  };
  const openTailerPlayer = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoThumbnail) {
      // show video player
      setOpenPopupPlayer(true);
    }
  };

  const onAddTrainer = () => {
    setErrors((prev) => ({
      ...prev,
      trainers: "",
    }));
    setTrainerModal(true);
  };

  const onAddBodyFocus = () => {
    setBodyfocusModal(true);
  };

  const onAddGoals = () => {
    setErrors((prev) => ({
      ...prev,
      selectedGoals: "",
    }));

    setGoalsModal(true);
  };

  const onAddFitnessInterests = () => {
    setFitnessInterestModal(true);
  };

  const onAddInfo = () => {
    const newChallengeInfo = challengeInfo ? [...challengeInfo] : [];
    newChallengeInfo.push("");
    setChallengeInfo(newChallengeInfo);
  };

  const onAddWeek = () => {
    const newWeeks = weeks ? [...weeks] : [];
    newWeeks.push({
      id: v4(),
      weekName: "",
      weekSubtitle: "",
      workouts: [],
    });
    setWeeks(newWeeks);
  };

  const onAddWorkout = (weekId) => {
    const newWeeks = [...weeks];
    const weekIndex = newWeeks.findIndex(
      (week) => week.id === weekId || week._id === weekId,
    );
    if (weekIndex !== -1) {
      newWeeks[weekIndex].workouts.push({
        id: v4(),
        title: "",
        subtitle: "",
        renderWorkout: true, // Default to "with exercises"
        exercises: [
          {
            break: 0,
            createdAt: "",
            exerciseGroupName: "Introduction",
            exerciseLength: 0,
            title: get(
              strings,
              "challengeStudio.introduction_to_workout",
              "Introduction to workout",
            ),
            videoURL: "",
            voiceOverLink: "",
            videoThumbnailURL: "",
            id: v4(),
          },
        ],
        equipments: [],
        infoFile: null,
      });
      setWeeks(newWeeks);
    }
  };

  const handleSaveChallenge = async () => {
    setLoading(true);

    const errors = [];
    const errorToShow = {};
    if (!challengeName) {
      errors.push(
        get(
          strings,
          "challengeStudio.challenge_name_required",
          "Challenge Name is required",
        ),
      );
      errorToShow.challengeName = get(
        strings,
        "challengeStudio.challenge_name_required",
        "Challenge Name is required",
      );
    }
    // if (!challengeDescription) {
    //   errors.push("Description is required");
    //   errorToShow.challengeDescription = "Description is required";
    // }
    if (!pack) {
      errors.push(get(strings, "challengeStudio.select_pack", "Select a pack"));
      errorToShow.pack = get(
        strings,
        "challengeStudio.select_pack",
        "Select a pack",
      );
    }
    if (
      pack === "CHALLENGE_1" &&
      (customPrice === "" ||
        customPrice === null ||
        customPrice === undefined ||
        customPrice < 0)
    ) {
      errors.push(
        get(strings, "challengeStudio.price_required", "Price is required"),
      );
      errorToShow.customPrice = get(
        strings,
        "challengeStudio.price_required",
        "Price is required",
      );
    }

    // if (!thumbnail) {
    //   errors.push("Thumbnail is required");
    //   errorToShow.thumbnail = "Thumbnail is required";
    // }
    // if (!videoThumbnail) {
    //   errorToShow.videoThumbnail = "Video Thumbnail is required";
    //   errors.push("Video Thumbnail is required");
    // }
    // if (!duration) {
    //   errorToShow.duration = "Duration is required";
    //   errors.push("Duration is required");
    // }
    // if (!difficulty) errors.push("Difficulty is required");
    if (!intensity) {
      errors.push(
        get(
          strings,
          "challengeStudio.intensity_required",
          "Intensity is required",
        ),
      );
      errorToShow.intensity = get(
        strings,
        "challengeStudio.intensity_required",
        "Intensity is required",
      );
    }
    if (!seletedTrainers || seletedTrainers.length === 0) {
      errors.push(
        get(
          strings,
          "challengeStudio.trainer_required",
          "At least one Trainer is required",
        ),
      );
      errorToShow.trainers = get(
        strings,
        "challengeStudio.trainer_required",
        "At least one Trainer is required",
      );
    }
    // if (!selectedGoals || selectedGoals.length === 0) {
    //   errors.push("At least one Goal is required");
    //   errorToShow.selectedGoals = "At least one Goal is required";
    // }

    setErrors(errorToShow);
    if (errors.length > 0) {
      notification.error({
        message: get(
          strings,
          "challengeStudio.fill_required_fields",
          "Please fill all required fields",
        ),
        description: (
          <ul>
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        ),
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Use challenge's original language for updates, global language for new challenges
      const effectiveLanguage =
        isUpdate && challengeLanguage ? challengeLanguage : language;
      const obj = {
        language: effectiveLanguage,
        challengeName: challengeName,
        description: challengeDescription,
        price: customPrice,
        points: points,
        currency: "€",
        thumbnailLink: typeof thumbnail === "object" ? thumbnail.link : "",
        videoThumbnailLink:
          typeof videoThumbnail === "object" ? videoThumbnail.link : "",
        trainers: seletedTrainers,
        trainersFitnessInterest: selectedFitnessInterest,
        challengeGoals: selectedGoals.map((s) => {
          if (typeof s === "object") {
            return s.name;
          } else {
            return s;
          }
        }),
        difficulty: "",
        body: selectedBodyFocus,
        access: pack,
        duration: duration,
        videoLink:
          typeof videoThumbnail === "object"
            ? videoThumbnail.link
            : videoThumbnail,
        weeks: await handleWeeksForUpdate(weeks, isUpdate),
        music: musics.map((m) => ({
          name: m.name,
          url: m.link,
        })),
        additionalProducts: [],
        results: result,
        informationList: challengeInfo
          ? challengeInfo.map((i) => ({
              info: i,
              icon: "",
            }))
          : [],
        allowComments,
        allowReviews,
        isPublic: makePublic,
        ...(hasAnyRole(userInfo, ["admin"]) && { adminApproved }),
      };

      // Intensity is always set (replaces difficulty)
      obj.intensity = intensity || "";
      // Grouping fields only when multiple intensities is checked
      if (multipleIntensities) {
        obj.multipleIntensities = true;
        if (intensityGroupId) {
          obj.intensityGroupId = intensityGroupId;
        } else {
          // No existing group selected — backend will auto-generate
        }
      } else {
        obj.intensityGroupId = "";
      }

      // Add translationKey for linking with other language versions
      if (translationKey) {
        obj.translationKey = translationKey;
      } else if (isUpdate) {
        obj.translationKey = null; // Allow clearing the connection
      }

      console.log("us update", isUpdate);
      if (isUpdate) {
        await updateChallenge(obj, props.match.params.challengeId);
        reloadWithoutConfirmation();
      } else {
        const res = await createChallenge(obj);
        if (userCreatePost) {
          await createAPost(res.weeks._id);
        }
        props.history.push(`/admin/v2/challenge-studio/${res.weeks._id}`);
      }
      setLoading(false);
    } catch (err) {
      console.log("Error saving challenge:", err);

      // Check if it's a duplicate challenge name error
      if (
        err.response?.status === 409 &&
        err.response?.data?.error === "DUPLICATE_CHALLENGE_NAME"
      ) {
        setErrors((prev) => ({
          ...prev,
          challengeName: get(
            strings,
            "challengeStudio.duplicate_name",
            "A challenge with this name already exists",
          ),
        }));
      }

      // Check if it's a duplicate intensity in group error
      if (
        err.response?.status === 409 &&
        err.response?.data?.error === "DUPLICATE_INTENSITY"
      ) {
        setErrors((prev) => ({
          ...prev,
          intensity: get(
            strings,
            "challengeStudio.duplicate_intensity",
            "This intensity already exists in the selected group",
          ),
        }));
        notification.error({
          message: get(strings, "challengeStudio.duplicate_intensity_title", "Duplicate Intensity"),
          description:
            err.response.data.message ||
            "A challenge with this intensity already exists in the group.",
        });
      }

      // Check if it's a duplicate translation link error
      if (
        err.response?.status === 409 &&
        err.response?.data?.error === "DUPLICATE_TRANSLATION_LINK"
      ) {
        notification.error({
          message: "Translation Link Conflict",
          description:
            err.response.data.message ||
            "Another challenge in this language is already linked with this translation.",
        });
      }

      setLoading(false);
      // Error notification is already handled in the service function
      return;
    }
  };

  const createAPost = async (id) => {
    const values = {
      title: challengeName,
      text: challengeDescription,
      image: typeof thumbnail === "object" ? thumbnail.link : "",
      type: "Challenge",
      url: `/challenge/${slug(challengeName)}/${id}`,
      language: language,
    };
    await createPost(values);
    // setCreatePostModalVisible(false);
    // console.log(values);
  };

  const handleWeeksForUpdate = async (weeks, isUpdate) => {
    // Helper function to transform workout data to be consistent format for both create and update
    const transformWorkout = (workout) => {
      // Extract intro exercise if it exists
      const introExercise = workout.exercises[0];
      const remainingExercises = introExercise
        ? workout.exercises.slice(1)
        : workout.exercises;

      return {
        // Include _id only when updating existing workout
        ...(workout._id && { _id: workout._id }),
        title: workout.title,
        subtitle: workout.subtitle,
        infotitle: "Workout info file",
        infoFile:
          workout.infoFile && typeof workout.infoFile === "object"
            ? workout.infoFile.link
            : "",
        relatedEquipments: workout.equipments
          ? workout.equipments.map((eq) => eq._id)
          : [],
        relatedProducts: [],
        introVideoLink: introExercise ? introExercise.videoURL : "",
        introVideoThumbnailLink: introExercise
          ? introExercise.videoThumbnailURL
          : "",
        introVideoLength: introExercise ? introExercise.exerciseLength : "",
        isRendered: workout.renderWorkout,
        exercises: workout.renderWorkout
          ? remainingExercises.map((e) => ({
              exerciseId: e.exerciseId,
              exerciseLength: e.exerciseLength,
              break: e.break,
              groupName: e.exerciseGroupName,
            }))
          : remainingExercises.map((e) => ({
              renderedWorkoutExerciseName: e.title,
              renderedWorkoutExerciseVideo: e.videoURL,
            })),
      };
    };

    // Helper function to transform week data into desired format
    const transformWeek = (week) => {
      const { id, weekId, weekTitle, workouts, ...weekData } = week;
      return weekData;
    };

    if (isUpdate) {
      const weekPromises = weeks.map(async (week) => {
        // Process each workout inside this week
        const workoutPromises = week.workouts.map(async (workout) => {
          const transformedWorkout = transformWorkout(workout);

          if (workout._id) {
            await updateWorkoutOnBackend([transformedWorkout]);
            return workout._id;
          } else {
            const newWorkout = await updateWorkoutOnBackend([
              transformedWorkout,
            ]);
            const ids = newWorkout.map((w) => w.data.data);
            return ids[0];
          }
        });

        // Wait for all workouts to be processed
        const workoutIds = await Promise.all(workoutPromises);
        console.log("workoutIds", workoutIds, workoutPromises);

        // Return transformed week data with workout IDs
        const transformedWeek = transformWeek(week);
        transformedWeek.workouts = workoutIds;

        return transformedWeek;
      });

      // Wait for all weeks to be processed
      return Promise.all(weekPromises);
    } else {
      // For non-update mode, transform without API calls
      return weeks.map((week) => {
        const transformedWeek = transformWeek(week);
        transformedWeek.workout = week.workouts.map((workout) =>
          transformWorkout(workout),
        );
        return transformedWeek;
      });
    }
  };

  const duplicateWeek = (week) => {
    const duplicateWeek = {
      id: v4(),
      weekName: week.weekName,
      weekSubtitle: week.weekSubtitle,
      workouts: week.workouts.map((workout) => ({
        title: workout.title,
        subtitle: workout.subtitle,
        renderWorkout: workout.renderWorkout,
        equipments: [],
        infoFile: workout.infoFile,
        exercises: workout.exercises.map((exercise) => ({
          ...exercise,
          id: v4(),
        })),
        id: v4(),
      })),
    };

    setWeeks((prevWeeks) => [...prevWeeks, duplicateWeek]);
  };

  const duplicateWorkout = (weekId, workout) => {
    const newWorkout = {
      title: workout.title,
      subtitle: workout.subtitle,
      renderWorkout: workout.renderWorkout, // Keep same type as original
      equipments: workout.equipments || [],
      infoFile: workout.infoFile,
      id: v4(),
      exercises: workout.exercises.map((exercise) => ({
        ...exercise,
        id: v4(),
      })),
    };

    setWeeks((prevWeeks) =>
      prevWeeks.map((week) =>
        week.id === weekId || week._id === weekId
          ? { ...week, workouts: [...week.workouts, newWorkout] }
          : week,
      ),
    );
  };

  const handleWorkoutReorder = (newworkoutOrder, weekIndex) => {
    // new workout ordered ids
    const newOrderIds = newworkoutOrder.map((workout) => workout.key);
    // now order workouts in week
    setWeeks((prevWeeks) => {
      const updatedWeeks = [...prevWeeks];
      const week = updatedWeeks[weekIndex];
      // Map the new order of ids to the actual workout objects
      week.workouts = newOrderIds
        .map((key) => week.workouts.find((w) => (w.id || w._id) === key))
        .filter(Boolean); // Remove undefined values
      return updatedWeeks;
    });
  };

  const handleWeekReorder = (newWeekOrder) => {
    // new week ordered ids - extract id from the week objects
    const filteredOrder = newWeekOrder.filter(
      (item) => item && item.id !== undefined,
    );
    const newOrderIds = filteredOrder.map((week) => week.id);

    // now order weeks
    setWeeks((prevWeeks) => {
      const updatedWeeks = [...prevWeeks];
      // Map the new order of ids to the actual week objects
      return newOrderIds
        .map((id) => updatedWeeks.find((w) => (w.id || w._id) === id))
        .filter(Boolean); // Remove undefined values
    });
  };

  // Helper function to check if workout has content (is locked)
  const isWorkoutLocked = (workout) => {
    if (!workout.exercises || workout.exercises.length === 0) return false;

    // Check if any exercise has content
    return workout.exercises.some((exercise, index) => {
      // Intro exercise (index 0) - check if it has video or exerciseId
      if (index === 0) {
        return exercise.videoURL || exercise.exerciseId;
      }
      // Other exercises - check if they have video, exerciseId, or meaningful title
      return (
        exercise.videoURL ||
        exercise.exerciseId ||
        (exercise.title && exercise.title.trim() !== "")
      );
    });
  };

  const getThumbnailLink = (thumbnail) => {
    if (!thumbnail) return "";
    if (typeof thumbnail === "string") return thumbnail.replace(/ /g, "%20");
    if (thumbnail.link) return thumbnail.link.replace(/ /g, "%20");
    return "";
  };

  return (
    <div>
      {loading && (
        <div
          style={{
            background: "transparent",
            height: "100vh",
            zIndex: "9999",
            position: "fixed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            width: "100%",
          }}
        >
          <LoadingOutlined style={{ fontSize: "80px", color: "#ff7700" }} />
        </div>
      )}
      <Navbar />
      <RemoteMediaManager
        visible={mediaManagerVisible}
        setVisible={setMediaManagerVisible}
        type={mediaManagerType}
        actions={mediaManagerActions}
      />
      <EditTypeName
        editItemNameModalVisible={editItemNameModalVisible}
        setEditItemModelVisible={setEditItemNameModalVisible}
        fethData={fetchDataV2}
        selectedItemForUpdate={selectedItemForUpdate}
        titleName={selectedItemForUpdateTitle}
      />

      <PopupPlayer
        open={openPopupPlayer}
        onCancel={() => setOpenPopupPlayer(false)}
        video={videoThumbnail?.link}
      />

      {/* modal to create a new trainer goal */}
      <Modal
        onCancel={() => setFitnessInterestModal(false)}
        footer={false}
        visible={fitnessInterestModal}
      >
        {/* body focus stuff */}
        <p className="font-paragraph-white">
          <T>challengeStudio.create_fitness_interest</T>
        </p>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            value={newTrainerFitnessInterest}
            onChange={(e) => setNewTrainerFitnessInterest(e.target.value)}
          />
          <Button
            type="primary"
            htmlType="submit"
            style={{
              backgroundColor: "var(--color-orange)",
              borderColor: "var(--color-orange)",
              marginLeft: "5px",
            }}
            onClick={async () => {
              if (newTrainerFitnessInterest.length > 0) {
                await createTrainerGoal({
                  name: newTrainerFitnessInterest,
                  language: language,
                });
                // setShowBodyfocusModal(false);
                fetchDataV2();
              }
            }}
          >
            <T>admin.create</T>
          </Button>
        </div>
        <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
          <span className="font-subheading-white">
            <T>challengeStudio.all_fitness_interests</T>
          </span>
          <List
            size="small"
            bordered
            dataSource={allFitnessInterests}
            renderItem={(g) => (
              <List.Item
                style={{
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap:"wrap",
                  gap:"5px"
                }}
              >
                <span>{g.name}</span>

                <span>
                  <Button
                    onClick={() => {
                      setSelectedFitnessInterest((prev) => {
                        const isExist = prev.find((item) => item._id === g._id);
                        if (isExist) {
                          return prev.filter((item) => item._id !== g._id);
                        } else {
                          return [...prev, g];
                        }
                      });
                    }}
                    style={{ marginRight: "10px" }}
                    type="primary"
                  >
                    {selectedFitnessInterest.find(
                      (item) => item._id === g._id,
                    ) ? (
                      <T>challengeStudio.unselect</T>
                    ) : (
                      <T>challengeStudio.select</T>
                    )}
                  </Button>

                  <Button
                    onClick={async () => {
                      await deleteTrainerGoals(g._id);
                      setSelectedFitnessInterest((prev) =>
                        prev.filter((item) => item._id !== g._id),
                      );
                      fetchDataV2();
                    }}
                    style={{ marginRight: "10px" }}
                    type="primary"
                    danger
                  >
                    <T>admin.delete</T>
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      setSelectedItemForUpdateTitle(
                        get(
                          strings,
                          "challengeStudio.update_fitness_interest",
                          "Update Fitness Interest",
                        ),
                      );
                      setSelectedItemForUpdate(g);
                      setEditItemNameModalVisible(true);
                    }}
                  >
                    <T>admin.edit</T>
                  </Button>
                </span>
              </List.Item>
            )}
          />
        </div>
      </Modal>

      <Modal
        onCancel={() => setBodyfocusModal(false)}
        footer={false}
        visible={bodyFocusModal}
      >
        {/* body focus stuff */}
        <p className="font-paragraph-white">
          <T>challengeStudio.create_body_focus</T>
        </p>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            value={newBodyFocus}
            onChange={(e) => setNewBodyFocus(e.target.value)}
          />
          <Button
            type="primary"
            htmlType="submit"
            style={{
              backgroundColor: "var(--color-orange)",
              borderColor: "var(--color-orange)",
              marginLeft: "5px",
            }}
            onClick={async () => {
              if (newBodyFocus.length > 0) {
                await createBodyFocus(newBodyFocus, language);

                fetchDataV2();
              }
            }}
          >
            <T>admin.create</T>
          </Button>
        </div>
        <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
          <span className="font-subheading-white">
            <T>challengeStudio.all_body_focus</T>
          </span>
          <List
            size="small"
            bordered
            dataSource={allBodyFocus}
            renderItem={(g) => (
              <List.Item
                style={{
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                      flexWrap:"wrap",
                  gap:"5px"
                }}
              >
                <span>{g.name}</span>

                <span>
                  <Button
                    onClick={() => {
                      setSelectedBodyFocus((prev) => {
                        const isExist = prev.find((item) => item._id === g._id);
                        if (isExist) {
                          return prev.filter((item) => item._id !== g._id);
                        } else {
                          return [...prev, g];
                        }
                      });
                    }}
                    style={{ marginRight: "10px" }}
                    type="primary"
                  >
                    {selectedBodyFocus.find((item) => item._id === g._id) ? (
                      <T>challengeStudio.unselect</T>
                    ) : (
                      <T>challengeStudio.select</T>
                    )}
                  </Button>

                  <Button
                    onClick={async () => {
                      await deleteChallengeBodyfocus(g._id);
                      setSelectedBodyFocus((prev) =>
                        prev.filter((item) => item._id !== g._id),
                      );
                      fetchDataV2();
                    }}
                    style={{ marginRight: "10px" }}
                    type="primary"
                    danger
                  >
                    <T>admin.delete</T>
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      setSelectedItemForUpdateTitle(
                        get(
                          strings,
                          "challengeStudio.update_body_focus",
                          "Update Body Focus",
                        ),
                      );
                      setSelectedItemForUpdate(g);
                      setEditItemNameModalVisible(true);
                    }}
                  >
                    <T>admin.edit</T>
                  </Button>
                </span>
              </List.Item>
            )}
          />
        </div>
      </Modal>

      <Modal
        onCancel={() => setGoalsModal(false)}
        footer={false}
        visible={goalsModal}
      >
        {/* body focus stuff */}
        <p className="font-paragraph-white">
          <T>challengeStudio.all_goals</T>
        </p>
        <div style={{ height: "200px", overflow: "auto", marginTop: "10px" }}>
          <List
            size="small"
            bordered
            dataSource={allGoals}
            renderItem={(g) => (
              <List.Item
                style={{
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                      flexWrap:"wrap",
                  gap:"5px"
                }}
              >
                <span>{g.name}</span>

                <span>
                  <Button
                    onClick={() => {
                      setSelectedGoals((prev) => {
                        const isExist = prev.find((item) => item._id === g._id);
                        if (isExist) {
                          return prev.filter((item) => item._id !== g._id);
                        } else {
                          return [...prev, g];
                        }
                      });
                    }}
                    style={{ marginRight: "10px" }}
                    type="primary"
                  >
                    {selectedGoals.find((item) => item._id === g._id) ? (
                      <T>challengeStudio.unselect</T>
                    ) : (
                      <T>challengeStudio.select</T>
                    )}
                  </Button>
                </span>
              </List.Item>
            )}
          />
        </div>
      </Modal>

      <Modal
        onCancel={() => setTrainerModal(false)}
        footer={false}
        visible={trainerModal}
      >
        {/* body focus stuff */}
        <p className="font-paragraph-white">
          <T>challengeStudio.all_trainers</T>
        </p>
        <div style={{ height: "200px", overflow: "auto", marginTop: "10px" }}>
          <List
            size="small"
            bordered
            dataSource={allTrainers}
            renderItem={(g) => (
              <List.Item
                style={{
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                      flexWrap:"wrap",
                  gap:"5px"
                }}
              >
                <span>
                  {g.firstName} {g.lastName}
                </span>

                <span>
                  {!(
                    g._id === usereDtails._id && userInfo.role === "trainer"
                  ) && (
                    <Button
                      onClick={() => {
                        setSelectedTrainers((prev) => {
                          const isExist = prev.find(
                            (item) => item._id === g._id,
                          );
                          if (isExist) {
                            return prev.filter((item) => item._id !== g._id);
                          } else {
                            return [...prev, g];
                          }
                        });
                      }}
                      style={{ marginRight: "10px" }}
                      type="primary"
                    >
                      {seletedTrainers.find((item) => item._id === g._id) ? (
                        <T>challengeStudio.unselect</T>
                      ) : (
                        <T>challengeStudio.select</T>
                      )}
                    </Button>
                  )}
                </span>
              </List.Item>
            )}
          />
        </div>
      </Modal>

      {/* end */}

      {/* main page starts now */}
      <div
        style={{
          background: "#2a2f37",
        }}
      >
        <div className="trainer-profile-container">
          <div
            className="trainer-profile-container-column1 adminV2-bi-trainer-profile-container-column1"
            onClick={openForThumbnail}
            style={{
              background: isVideoFile(thumbnail)
                ? "linear-gradient(rgba(23, 30, 39, 0), rgb(23, 30, 39))"
                : `linear-gradient(rgba(23, 30, 39, 0), rgb(23, 30, 39)), url(${getThumbnailLink(
                    thumbnail,
                  )})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              border: errors.thumbnail && "2px solid red",
              cursor: "pointer",
              // position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Video cover loading spinner */}
            {isVideoFile(thumbnail) && coverVideoLoading && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#171e27",
                  zIndex: 3,
                }}
              >
                <LoadingOutlined
                  style={{ fontSize: "50px", color: "#ff7700" }}
                />
              </div>
            )}
            {/* Video cover background - autoplay, muted, loop */}
            {isVideoFile(thumbnail) && (
              <video
                src={getThumbnailLink(thumbnail)}
                autoPlay
                muted
                loop
                playsInline
                onCanPlay={() => setCoverVideoLoading(false)}
                onLoadStart={() => setCoverVideoLoading(true)}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  zIndex: 0,
                  opacity: coverVideoLoading ? 0 : 1,
                  transition: "opacity 0.3s ease",
                }}
              />
            )}
            {/* Gradient overlay for video */}
            {isVideoFile(thumbnail) && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background:
                    "linear-gradient(rgba(23, 30, 39, 0), rgb(23, 30, 39))",
                  zIndex: 1,
                }}
              />
            )}
            <div
              className="profile-box adminV2-bi-profile-box"
              onClick={(e) => {
                e.stopPropagation();
              }}
              style={{ position: "relative", zIndex: 2 }}
            >
              <div className="challenge-profile-box-1 adminV2-bi-challenge-profile-box-1">
                <div
                  onClick={openForTrailer}
                  style={{
                    border: errors.videoThumbnail && "2px solid red",
                  }}
                >
                  <p
                    className="font-paragraph-white adminV2-bi-trailername"
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    {videoThumbnail ? (
                      videoThumbnail.link
                    ) : (
                      <T>challengeStudio.add_trailer</T>
                    )}
                  </p>
                  <img
                    src={ChallengeProfileSubtract}
                    alt=""
                    onClick={openTailerPlayer}
                    style={{ cursor: "pointer" }}
                  />
                </div>
                <input
                  placeholder={get(
                    strings,
                    "challengeStudio.challenge_name",
                    "Challenge Name",
                  )}
                  style={{
                    border: errors.challengeName && "2px solid red",
                  }}
                  className="font-heading-white adminV2-bi-input"
                  onChange={(e) => {
                    if (errors.challengeName) {
                      setErrors((prev) => ({
                        ...prev,
                        challengeName: "",
                      }));
                    }
                    setChallengeName(e.target.value);
                  }}
                  value={challengeName}
                />
                {props.match.params.challengeId && <></>}
              </div>
              <div className="challenge-profile-box-2 adminV2-bi-challenge-profile-box-2">
                {/* Challenge Points + Duration */}
                <div
                  className="challenge-profile-box-2-info"
                  style={{
                    display: "grid",
                    gridTemplateColumns: props.match.params.challengeId
                      ? "1fr 1fr 1fr"
                      : "1fr 1fr",
                    gridGap: "8px",
                    alignItems: "inherit",
                  }}
                >
                  <input
                    placeholder={get(
                      strings,
                      "challengeStudio.challenge_points",
                      "Challenge Points",
                    )}
                    className="font-paragraph-white adminV2-bi-input"
                    onChange={(e) => {
                      setPoints(e.target.value);
                    }}
                    value={points}
                    type="number"
                  />

                  <input
                    placeholder={get(
                      strings,
                      "challengeStudio.duration_in_minutes",
                      "Duration in minutes",
                    )}
                    className="font-paragraph-white adminV2-bi-input"
                    onChange={(e) => {
                      if (errors.duration) {
                        setErrors((prev) => ({
                          ...prev,
                          duration: "",
                        }));
                      }
                      setDuration(e.target.value);
                    }}
                    value={duration}
                    type="number"
                    style={{
                      border: errors.duration && "2px solid red",
                    }}
                  />

                  <div
                    className="challenge-profile-box-2-info"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    {props.match.params.challengeId && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: "8px",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={ShareIcon}
                          alt="share"
                          style={{
                            width: "34px",
                            height: "34px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            const url = `${window.location.origin}/challenge/${slug(
                              challengeName || "",
                            )}/${props.match.params.challengeId}`;
                            navigator.clipboard
                              .writeText(url)
                              .then(() => {
                                message.success("Challenge link copied!");
                              })
                              .catch(() => {
                                message.error("Failed to copy link");
                              });
                          }}
                          title="Copy challenge link"
                        />
                        <img
                          src={FavIcon}
                          alt="fav"
                          style={{
                            width: "34px",
                            height: "34px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            message.success(
                              get(
                                strings,
                                "challenge_profile.added_to_favourites",
                                "Added to favourites!",
                              ),
                            );
                          }}
                          title={get(
                            strings,
                            "challenge_profile.added_to_favourites",
                            "Add to favourites",
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>
                {/* Intensity + Multiple intensity grouping */}
                <div
                  style={{
                    border: "2px dashed #fff",
                    borderRadius: "2px",
                    padding: "5px 12px 5px 5px",
                    margin: "5px"

                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="challenge-profile-box-2-info"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr",
                      gridGap: "8px",
                      alignItems: "inherit",
                    }}
                  >
                    <Select
                      style={{
                        width: "100%",
                        border: errors.intensity ? "2px solid red" : undefined,
                        borderRadius: errors.intensity ? "6px" : undefined,
                      }}
                      placeholder={get(
                        strings,
                        "challengeStudio.select_intensity",
                        "Select intensity",
                      )}
                      value={intensity || undefined}
                      onChange={(val) => {
                        if (errors.intensity) {
                          setErrors((prev) => ({ ...prev, intensity: "" }));
                        }
                        setIntensity(val);
                      }}
                      className="font-paragraph-white adminV2-bi-input"
                    >
                      <Select.Option value="Easy">
                        <T>challengeStudio.intensity_easy</T>
                      </Select.Option>
                      <Select.Option value="Medium">
                        <T>challengeStudio.intensity_medium</T>
                      </Select.Option>
                      <Select.Option value="Hard">
                        <T>challengeStudio.intensity_hard</T>
                      </Select.Option>
                    </Select>
                  </div>
                  <div style={{ marginTop: "6px" }}>
                    <Checkbox
                      checked={multipleIntensities}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setMultipleIntensities(checked);
                        if (!checked) {
                          setIntensityGroupId("");
                          setGroupMode("new");
                        }
                      }}
                      style={{ color: "#ccc" }}
                    >
                      <span className="font-paragraph-white">
                        <T>challengeStudio.multiple_intensity_levels</T>
                      </span>
                    </Checkbox>
                    {multipleIntensities && (
                      <div style={{ marginTop: "8px" }}>
                        <Radio.Group
                          value={groupMode}
                          onChange={(e) => {
                            setGroupMode(e.target.value);
                            if (e.target.value === "new") {
                              setIntensityGroupId("");
                              setPriceInheritedFromGroup(false);
                            }
                          }}
                          style={{ marginBottom: "8px" }}
                        >
                          <Radio value="new" style={{ color: "#ccc" }}>
                            <T>challengeStudio.create_new_group</T>
                          </Radio>
                          <Radio value="existing" style={{ color: "#ccc" }}>
                            <T>challengeStudio.add_to_existing_group</T>
                          </Radio>
                        </Radio.Group>
                        {groupMode === "existing" && (
                          <Select
                            style={{ width: "100%" }}
                            value={intensityGroupId || undefined}
                            onChange={(val) => {
                              setIntensityGroupId(val);
                              // Auto-fill price/currency/access from group
                              const group = trainerGroups.find(
                                (g) => g.groupId === val,
                              );
                              if (group) {
                                if (group.price !== undefined)
                                  setCustomPrice(group.price);
                                if (group.access) setPack(group.access);
                                setPriceInheritedFromGroup(true);
                              }
                            }}
                            placeholder={get(
                              strings,
                              "challengeStudio.select_a_group",
                              "Select a group",
                            )}
                            className="font-paragraph-white adminV2-bi-input"
                          >
                            {trainerGroups.map((g) => (
                              <Select.Option key={g.groupId} value={g.groupId}>
                                {g.challenges
                                  .map((c) => c.challengeName)
                                  .join(", ")}{" "}
                                (
                                {g.challenges
                                  .map((c) => c.intensity)
                                  .join(", ")}
                                )
                              </Select.Option>
                            ))}
                          </Select>
                        )}
                        {priceInheritedFromGroup &&
                          groupMode === "existing" && (
                            <div
                              style={{
                                color: "#ff7700",
                                fontSize: "11px",
                                marginTop: "4px",
                              }}
                            >
                              Price & access inherited from group
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
                <textarea
                  rows={4}
                  placeholder={get(
                    strings,
                    "challengeStudio.add_challenge_description",
                    "Add challenge description",
                  )}
                  className="font-paragraph-white adminV2-bi-input"
                  onChange={(e) => {
                    if (errors.challengeDescription) {
                      setErrors((prev) => ({
                        ...prev,
                        challengeDescription: "",
                      }));
                    }
                    setChallengeDescription(e.target.value);
                  }}
                  value={challengeDescription}
                  style={{
                    height: "auto",
                    width: "100%",
                    resize: "vertical",
                    border: errors.challengeDescription && "2px solid red",
                  }} // Optional: Allow resizing vertically
                />
              </div>
            </div>
          </div>
          <div className="trainer-profile-container-column2">
            {/* Translation selector - shown for both new and existing challenges */}
            {(
              <div
                className="trainer-profile-goals"
                style={{ marginBottom: "20px" }}
              >
                <div
                  className="trainer-profile-goals-heading font-paragraph-white"
                  style={{ color: "#72777B", textTransform: "uppercase" }}
                >
                  {isUpdate ? (
                    "Link Translation"
                  ) : (
                    <T>challengeStudio.translate_existing_challenge</T>
                  )}
                </div>
                <div
                  ref={translationDropdownRef}
                  style={{
                    position: "relative",
                    width: "100%",
                    marginTop: "10px",
                  }}
                >
                  {/* Selected value / trigger */}
                  <div
                    onClick={() => setTranslationDropdownOpen((prev) => !prev)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      border: "1px solid #434343",
                      borderRadius: "6px",
                      cursor: "pointer",
                      background: "#1a1a2e",
                      minHeight: "38px",
                    }}
                  >
                    <span
                      style={{
                        color: selectedChallengeForTranslation
                          ? "#e0e0e0"
                          : "#888",
                        fontSize: "14px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1,
                      }}
                    >
                      {selectedChallengeForTranslation
                        ? (() => {
                            const found = allChallengesFromOtherLanguage.find(
                              (c) => c._id === selectedChallengeForTranslation,
                            );
                            const intensityLabel = found?.intensity
                              ? get(strings, {
                                  Easy: "challengeStudio.intensity_easy",
                                  Medium: "challengeStudio.intensity_medium",
                                  Hard: "challengeStudio.intensity_hard",
                                }[found.intensity], found.intensity)
                              : "";
                            return found?.challengeName +
                              (intensityLabel ? ` - ${intensityLabel}` : "") +
                              ` (${found?.language})`;
                          })()
                        : get(
                            strings,
                            "challengeStudio.select_challenge_to_translate",
                            "Select a challenge to translate (optional)",
                          )}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginLeft: "8px",
                        flexShrink: 0,
                      }}
                    >
                      {selectedChallengeForTranslation && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectChallengeForTranslation(null);
                            setTranslationSearch("");
                          }}
                          style={{
                            color: "#888",
                            cursor: "pointer",
                            fontSize: "16px",
                            lineHeight: 1,
                          }}
                          title="Clear"
                        >
                          ×
                        </span>
                      )}
                      <span
                        style={{
                          color: "#888",
                          fontSize: "10px",
                          transform: translationDropdownOpen
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }}
                      >
                        ▼
                      </span>
                    </span>
                  </div>

                  {/* Dropdown panel */}
                  {translationDropdownOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        left: 0,
                        right: 0,
                        zIndex: 99999,
                        background: "#1a1a2e",
                        border: "1px solid #434343",
                        borderRadius: "6px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                        overflow: "hidden",
                      }}
                    >
                      {/* Search input */}
                      <div style={{ padding: "8px" }}>
                        <input
                          type="text"
                          placeholder="Search challenges..."
                          value={translationSearch}
                          onChange={(e) => setTranslationSearch(e.target.value)}
                          autoFocus
                          style={{
                            width: "100%",
                            padding: "6px 10px",
                            border: "1px solid #555",
                            borderRadius: "4px",
                            background: "#16213e",
                            color: "#e0e0e0",
                            fontSize: "13px",
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                      {/* Options list */}
                      <div
                        style={{
                          maxHeight: "220px",
                          overflowY: "auto",
                          padding: "4px 0",
                        }}
                      >
                        {allChallengesFromOtherLanguage
                          .filter((c) =>
                            c.challengeName
                              .toLowerCase()
                              .includes(translationSearch.toLowerCase()),
                          )
                          .map((c) => {
                            const alreadyLinked =
                              c.translationKey &&
                              c.translationKey !== translationKey;
                            const isSelected =
                              c._id === selectedChallengeForTranslation;
                            return (
                              <div
                                key={c._id}
                                onClick={() => {
                                  if (!alreadyLinked) {
                                    handleSelectChallengeForTranslation(c._id);
                                    setTranslationDropdownOpen(false);
                                    setTranslationSearch("");
                                  }
                                }}
                                style={{
                                  padding: "8px 12px",
                                  cursor: alreadyLinked
                                    ? "not-allowed"
                                    : "pointer",
                                  color: alreadyLinked
                                    ? "#555"
                                    : isSelected
                                      ? "#fff"
                                      : "#ccc",
                                  background: isSelected
                                    ? "#2a2a4a"
                                    : "transparent",
                                  fontSize: "13px",
                                  transition: "background 0.15s",
                                  opacity: alreadyLinked ? 0.5 : 1,
                                }}
                                onMouseEnter={(e) => {
                                  if (!alreadyLinked)
                                    e.currentTarget.style.background =
                                      "#2a2a4a";
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected)
                                    e.currentTarget.style.background =
                                      "transparent";
                                }}
                              >
                                {c.challengeName}
                                {c.intensity && {
                                  Easy: "challengeStudio.intensity_easy",
                                  Medium: "challengeStudio.intensity_medium",
                                  Hard: "challengeStudio.intensity_hard",
                                }[c.intensity] && (
                                  <span style={{ color: "#888" }}>
                                    {" "}- <T>{{
                                      Easy: "challengeStudio.intensity_easy",
                                      Medium: "challengeStudio.intensity_medium",
                                      Hard: "challengeStudio.intensity_hard",
                                    }[c.intensity]}</T>
                                  </span>
                                )}
                                {" "}({c.language})
                                {alreadyLinked && (
                                  <span
                                    style={{
                                      marginLeft: "8px",
                                      fontSize: "11px",
                                      color: "#888",
                                    }}
                                  >
                                    — already linked
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        {allChallengesFromOtherLanguage.filter((c) =>
                          c.challengeName
                            .toLowerCase()
                            .includes(translationSearch.toLowerCase()),
                        ).length === 0 && (
                          <div
                            style={{
                              padding: "12px",
                              color: "#666",
                              textAlign: "center",
                              fontSize: "13px",
                            }}
                          >
                            No challenges found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {selectedChallengeForTranslation && (
                  <p
                    className="font-paragraph-white"
                    style={{
                      marginTop: "8px",
                      fontSize: "12px",
                      color: "#888",
                    }}
                  >
                    <T>challengeStudio.translation_linked</T>
                  </p>
                )}
              </div>
            )}

            {/* trainers */}
            <div className="trainer-profile-goals">
              <div
                className="trainer-profile-goals-heading font-paragraph-white"
                style={{ color: "#72777B", textTransform: "uppercase" }}
              >
                <T>challenge_profile.trainers</T>
              </div>

              <div className="challenge-trainers-container">
                {seletedTrainers.map((trainer) => (
                  <div
                    className="challenge-trainer-box"
                    style={{ background: "#283443", position: "relative" }}
                  >
                    <span
                      style={{
                        backgroundImage: `url(${trainer.avatarLink})`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        height: "50px",
                        width: "60px",
                        display: "block",
                      }}
                    ></span>

                    <a
                      href={`/trainer/${slug(trainer.firstName)}/${
                        trainer._id
                      }`}
                      target="_blank"
                      rel="noopener noreferrer" // For security reasons
                      className="challenge-trainer-box-text font-paragraph-white"
                    >
                      {trainer.firstName + " " + trainer.lastName}
                    </a>
                    {!(
                      trainer._id === usereDtails._id &&
                      userInfo.role === "trainer"
                    ) && (
                      <img
                        src={DeleteWhite}
                        alt="delete"
                        onClick={() => {
                          const newSelectedFitnessInterest =
                            seletedTrainers.filter(
                              (item) => item._id !== trainer._id,
                            );
                          setSelectedTrainers(newSelectedFitnessInterest);
                        }}
                        style={{
                          color: "#ff7700",
                          fontSize: "16px",
                          position: "absolute",
                          right: "20px",
                          cursor: "pointer",
                          zIndex: "9999",
                          height: "20px",
                          width: "20px",
                        }}
                      />
                    )}
                  </div>
                ))}

                <AddNewButton
                  style={{
                    margin: "5px",
                    border: errors.trainers && "2px solid red",
                  }}
                  onClick={onAddTrainer}
                />
              </div>
            </div>
            {/* fitness interest */}
            <div className="trainer-profile-goals">
              <div
                className="trainer-profile-goals-heading font-paragraph-white"
                style={{ color: "#72777B", textTransform: "uppercase" }}
              >
                <T>challengeStudio.fitness_interests</T>
              </div>
              <div className="trainer-profile-goals-container">
                {selectedFitnessInterest.map((interest) => (
                  <div
                    className="trainer-profile-goal font-paragraph-white"
                    style={{
                      marginRight: "1px",
                      background: "#283443",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                    key={interest._id}
                  >
                    <span>{interest.name}</span>
                    <DeleteFilled
                      onClick={() => {
                        const newSelectedFitnessInterest =
                          selectedFitnessInterest.filter(
                            (item) => item !== interest,
                          );
                        setSelectedFitnessInterest(newSelectedFitnessInterest);
                      }}
                      style={{
                        color: "#ff7700",
                        fontSize: "14px",
                        marginLeft: "5px",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                ))}

                <AddNewButton
                  onClick={onAddFitnessInterests}
                  type="small"
                  style={{
                    marginLeft: "10px",
                    height: "36px",
                    marginTop: "5px",
                  }}
                />
              </div>
            </div>
            {/* body focus */}
            <div className="trainer-profile-goals">
              <div
                className="trainer-profile-goals-heading font-paragraph-white"
                style={{ color: "#72777B", textTransform: "uppercase" }}
              >
                <T>challengeStudio.body_focus</T>
              </div>
              <div className="trainer-profile-goals-container">
                {selectedBodyFocus.map((interest) => (
                  <div
                    className="trainer-profile-goal font-paragraph-white"
                    style={{
                      marginRight: "1px",
                      background: "#283443",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                    key={interest._id}
                  >
                    <span>{interest.name}</span>
                    <DeleteFilled
                      onClick={() => {
                        const newSelectedFitnessInterest =
                          selectedBodyFocus.filter(
                            (item) => item._id !== interest._id,
                          );
                        setSelectedBodyFocus(newSelectedFitnessInterest);
                      }}
                      style={{
                        color: "#ff7700",
                        fontSize: "14px",
                        marginLeft: "5px",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                ))}

                <AddNewButton
                  onClick={onAddBodyFocus}
                  type="small"
                  style={{
                    marginLeft: "10px",
                    height: "36px",
                    marginTop: "5px",
                  }}
                />
              </div>
            </div>
            {/* goals */}
            <div className="trainer-profile-goals">
              <div
                className="trainer-profile-goals-heading font-paragraph-white"
                style={{ color: "#72777B", textTransform: "uppercase" }}
              >
                <T>challengeStudio.goals</T>
              </div>
              <div className="trainer-profile-goals-container">
                {selectedGoals.map((interest) => (
                  <div
                    className="trainer-profile-goal font-paragraph-white"
                    style={{
                      marginRight: "1px",
                      background: "#283443",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                    key={interest._id}
                  >
                    <span>{interest.name}</span>
                    <DeleteFilled
                      onClick={() => {
                        const newSelectedGoals = selectedGoals.filter(
                          (item) => item._id !== interest._id,
                        );
                        setSelectedGoals(newSelectedGoals);
                      }}
                      style={{
                        color: "#ff7700",
                        fontSize: "14px",
                        marginLeft: "5px",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                ))}

                <AddNewButton
                  onClick={onAddGoals}
                  type="small"
                  style={{
                    marginLeft: "10px",
                    height: "36px",
                    marginTop: "5px",
                    border: errors.selectedGoals && "2px solid red",
                  }}
                />
              </div>
            </div>
            {/* results */}
            <div className="trainer-profile-goals">
              <div
                className="trainer-profile-goals-heading font-paragraph-white"
                style={{ color: "#72777B", textTransform: "uppercase" }}
              >
                <T>challengeStudio.results</T>
              </div>
              <div>
                <textarea
                  rows={3}
                  placeholder={get(
                    strings,
                    "challengeStudio.enter_challenge_result",
                    "Enter challenge result",
                  )}
                  className="font-paragraph-white adminV2-bi-input"
                  onChange={(e) => setResult(e.target.value)}
                  value={result}
                  style={{ height: "auto", width: "100%", resize: "vertical" }} // Optional: Allow resizing vertically
                />
              </div>
            </div>
            {/* info */}
            <div className="trainer-profile-goals">
              <div
                className="trainer-profile-goals-heading font-paragraph-white"
                style={{ color: "#72777B", textTransform: "uppercase" }}
              >
                <T>challengeStudio.info</T>
              </div>

              {challengeInfo &&
                challengeInfo.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className="trainer-profile-goals-container"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "nowrap",
                      }}
                    >
                      <input
                        style={{
                          marginTop: "10px",
                        }}
                        className="font-paragraph-white adminV2-bi-input"
                        placeholder={get(
                          strings,
                          "challengeStudio.add_info",
                          "Add info",
                        )}
                        onChange={(e) => {
                          const newChallengeInfo = [...challengeInfo];
                          newChallengeInfo[index] = e.target.value;
                          setChallengeInfo(newChallengeInfo);
                        }}
                        value={item}
                      />
                      <DeleteFilled
                        onClick={() => {
                          const newChallengeInfo = [...challengeInfo];
                          newChallengeInfo.splice(index, 1);
                          setChallengeInfo(newChallengeInfo);
                        }}
                        style={{
                          color: "#ff7700",
                          fontSize: "20px",
                          cursor: "pointer",
                        }}
                      />
                    </div>
                  );
                })}
              <div>
                {/* add body focus here */}
                <AddNewButton
                  onClick={onAddInfo}
                  type="big"
                  style={{
                    marginTop: "10px",
                  }}
                />
              </div>
            </div>
            {/* personal journey */}
            <div className="trainer-profile-goals">
              <div
                className="trainer-profile-goals-heading font-paragraph-white"
                style={{ color: "#72777B", textTransform: "uppercase" }}
              >
                <T>challengeStudio.your_personal_journey</T>
              </div>
              <div style={{ marginTop: "10px" }}>
                <DraggableArea
                  onChange={handleWeekReorder}
                  direction="vertical"
                  itemType={ItemTypeWeek}
                >
                  {weeks &&
                    weeks.map((w, i) => (
                      <DraggableItem key={w.id || w._id} id={w.id || w._id}>
                        <Collapse
                          defaultActiveKey={[]}
                          onChange={(e) => setShowChangePanel(e)}
                          style={{
                            backgroundColor: "#171e27",
                            padding: "10px",
                          }}
                          key={w.id}
                        >
                          <Collapse.Panel
                            showArrow={false}
                            style={{
                              backgroundColor: "#1b2632",
                              marginBottom: "5px",
                            }}
                            header={
                              <>
                                <input
                                  style={{
                                    fontSize: "13px",
                                    backgroundColor: "#f37720",
                                    padding: "0px",
                                    width: "120px",
                                    margin: "0 0 12px 5px",
                                  }}
                                  className="adminV2-bi-input font-paragraph-white"
                                  value={w.weekName}
                                  placeholder={get(
                                    strings,
                                    "challengeStudio.name_group",
                                    "Name Group",
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                  onChange={(e) => {
                                    const newWeeks = [...weeks];
                                    newWeeks[i].weekName = e.target.value;
                                    setWeeks(newWeeks);
                                  }}
                                />

                                <div
                                  style={{
                                    fontWeight: "500",
                                    fontSize: "16px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "10px",
                                    textTransform: "uppercase",
                                  }}
                                  className="font-paragraph-white"
                                >
                                  <input
                                    style={{
                                      fontSize: "13px",
                                      maxWidth: "300px",
                                      margin: "0 0 12px 5px",
                                    }}
                                    className="adminV2-bi-input font-paragraph-white"
                                    value={w.weekSubtitle}
                                    placeholder={get(
                                      strings,
                                      "challengeStudio.add_description",
                                      "Add Description",
                                    )}
                                    onChange={(e) => {
                                      const newWeeks = [...weeks];
                                      newWeeks[i].weekSubtitle = e.target.value;
                                      setWeeks(newWeeks);
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                  />
                                  <span>
                                    {showChangePanel.includes(`${i + 1}`) ? (
                                      <UpOutlined
                                        style={{ color: "#ff7700" }}
                                      />
                                    ) : (
                                      <DownOutlined
                                        style={{ color: "#ff7700" }}
                                      />
                                    )}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    position: "absolute",
                                    right: "20px",
                                    top: "10px",
                                  }}
                                >
                                  <img
                                    src={DeleteIcon}
                                    alt="delete-icon"
                                    onClick={() => {
                                      const newWeek = weeks.filter(
                                        (item) => item.id !== w.id,
                                      );
                                      setWeeks(newWeek);
                                    }}
                                    style={iconStyle}
                                  />

                                  <img
                                    src={CopyIcon}
                                    alt=""
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      duplicateWeek(w);
                                    }}
                                    style={{
                                      ...iconStyle,
                                      marginLeft: "10px",
                                    }}
                                  />
                                  <DraggableHandle>
                                    <img
                                      src={DragAndDropIcon}
                                      alt=""
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                      style={{
                                        ...iconStyle,
                                        cursor: "move",
                                        marginLeft: "10px",
                                      }}
                                    />
                                  </DraggableHandle>
                                </div>
                              </>
                            }
                            key={i + 1}
                          >
                            <div className="trainer-profile-goals-container">
                              <div
                                style={{
                                  backgroundColor: isDraggingWorkout
                                    ? "rgba(59, 130, 246, 0.1)"
                                    : "transparent",
                                  border: isDraggingWorkout
                                    ? "2px dashed #3b82f6"
                                    : "2px solid transparent",
                                  transition: "all 0.3s ease",
                                  width: "100%",
                                  borderRadius: isDraggingWorkout
                                    ? "8px"
                                    : "0px",
                                }}
                              >
                                <DraggableArea
                                  onChange={(newOrder) =>
                                    handleWorkoutReorder(newOrder, i)
                                  }
                                  direction="vertical"
                                  itemType={ItemTypeWorkout}
                                  onDragStateChange={(dragging, draggedId) => {
                                    setIsDraggingWorkout(dragging);
                                    setDraggedWorkoutId(draggedId);
                                  }}
                                >
                                  {w.workouts &&
                                    w.workouts.map((workout) => (
                                      <DraggableItem
                                        key={workout.id}
                                        id={workout.id}
                                      >
                                        <div
                                          className="challenge-profile-comment font-paragraph-white"
                                          key={workout.id}
                                          style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            backgroundColor:
                                              draggedWorkoutId === workout.id
                                                ? "rgba(34, 197, 94, 0.15)"
                                                : "#2A2F368C",
                                            position: "relative",
                                            border:
                                              draggedWorkoutId === workout.id
                                                ? "2px solid #22c55e"
                                                : "2px solid transparent",
                                            transition: "all 0.3s ease",
                                            width: "100%",
                                            borderRadius:
                                              draggedWorkoutId === workout.id
                                                ? "8px"
                                                : "0px",
                                            opacity:
                                              draggedWorkoutId === workout.id
                                                ? "0.8"
                                                : "1",
                                          }}
                                        >
                                          <input
                                            style={{
                                              fontSize: "13px",
                                              padding: "5px",
                                              width: "200px",
                                              margin: "0 0 12px 5px",
                                            }}
                                            className="workout-input-field-1 adminV2-bi-input font-paragraph-white"
                                            value={workout.title}
                                            placeholder={get(
                                              strings,
                                              "challengeStudio.add_workout_title",
                                              "Add Workout Title",
                                            )}
                                            onChange={(e) => {
                                              const newWeeks = [...weeks];
                                              const weekIndex =
                                                newWeeks.findIndex(
                                                  (week) => week.id === w.id,
                                                );
                                              if (weekIndex !== -1) {
                                                const workoutIndex = newWeeks[
                                                  weekIndex
                                                ].workouts.findIndex(
                                                  (item) =>
                                                    item.id === workout.id,
                                                );
                                                if (workoutIndex !== -1) {
                                                  newWeeks[weekIndex].workouts[
                                                    workoutIndex
                                                  ].title = e.target.value;
                                                  setWeeks(newWeeks);
                                                }
                                              }
                                            }}
                                          />
                                          <input
                                            style={{
                                              fontSize: "13px",
                                              padding: "5px",
                                              width: "250px",
                                              margin: "0 0 12px 5px",
                                            }}
                                            className="adminV2-bi-input font-paragraph-white"
                                            value={workout.subtitle}
                                            placeholder={get(
                                              strings,
                                              "challengeStudio.add_more_info",
                                              "Add More Info",
                                            )}
                                            onChange={(e) => {
                                              const newWeeks = [...weeks];
                                              const weekIndex =
                                                newWeeks.findIndex(
                                                  (week) => week.id === w.id,
                                                );
                                              if (weekIndex !== -1) {
                                                const workoutIndex = newWeeks[
                                                  weekIndex
                                                ].workouts.findIndex(
                                                  (item) =>
                                                    item.id === workout.id,
                                                );
                                                if (workoutIndex !== -1) {
                                                  newWeeks[weekIndex].workouts[
                                                    workoutIndex
                                                  ].subtitle = e.target.value;
                                                  setWeeks(newWeeks);
                                                }
                                              }
                                            }}
                                          />

                                          <div
                                            className="workout-box-field-below"
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "space-between",
                                              width: "100%",
                                            }}
                                          >
                                            <div
                                              style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                              }}
                                            >
                                              <Checkbox
                                                style={{
                                                  color: "#fff",
                                                  fontSize: "13px",
                                                  margin: "0 0 12px 5px",
                                                }}
                                                checked={!workout.renderWorkout}
                                                onChange={(e) => {
                                                  // Check if workout is locked
                                                  if (
                                                    isWorkoutLocked(workout)
                                                  ) {
                                                    notification.error({
                                                      message: get(
                                                        strings,
                                                        "challengeStudio.workout_type_locked",
                                                        "Workout Type is Locked",
                                                      ),
                                                      description: get(
                                                        strings,
                                                        "challengeStudio.workout_type_locked_desc",
                                                        "Workout type is locked after adding content. Please create a new workout to change the type.",
                                                      ),
                                                      placement: "topRight",
                                                      duration: 5,
                                                    });
                                                    return;
                                                  }

                                                  const newWeeks = [...weeks];
                                                  const weekIndex =
                                                    newWeeks.findIndex(
                                                      (week) =>
                                                        week.id === w.id,
                                                    );
                                                  if (weekIndex !== -1) {
                                                    const workoutIndex =
                                                      newWeeks[
                                                        weekIndex
                                                      ].workouts.findIndex(
                                                        (item) =>
                                                          item.id ===
                                                          workout.id,
                                                      );
                                                    if (workoutIndex !== -1) {
                                                      // Invert the checkbox logic
                                                      newWeeks[
                                                        weekIndex
                                                      ].workouts[
                                                        workoutIndex
                                                      ].renderWorkout =
                                                        !e.target.checked;
                                                      setWeeks(newWeeks);
                                                    }
                                                  }
                                                }}
                                              >
                                                <T>
                                                  challengeStudio.workout_no_exercises
                                                </T>
                                              </Checkbox>
                                              <Tooltip
                                                title={get(
                                                  strings,
                                                  "challengeStudio.workout_type_tooltip",
                                                  "Workouts are 'with exercises' by default. Turn this on to create a workout without exercises",
                                                )}
                                                placement="top"
                                              >
                                                <img
                                                  src={HelpIcon}
                                                  alt="help"
                                                  style={{
                                                    height: "16px",
                                                    width: "16px",
                                                    cursor: "pointer",
                                                    marginBottom: "12px",
                                                  }}
                                                />
                                              </Tooltip>
                                            </div>

                                            <div
                                              style={{
                                                background: "#344150B0",
                                                padding: "10px",
                                                cursor: "pointer",
                                              }}
                                              onClick={() => {
                                                setShowVideoCreator(true);
                                                setSelectedWorkoutForStudioId({
                                                  workoutId: workout.id,
                                                  weekId: w.id,
                                                });
                                              }}
                                            >
                                              <img
                                                src={WorkoutStudioIcon}
                                                alt=""
                                              />
                                            </div>
                                          </div>
                                          <div
                                            style={{
                                              position: "absolute",
                                              right: "20px",
                                              top: "10px",
                                              display: "flex",
                                              gap: "14px",
                                            }}
                                          >
                                            <img
                                              src={DeleteWhite}
                                              alt="delete"
                                              onClick={() => {
                                                const newWeeks = [...weeks];
                                                const weekIndex =
                                                  newWeeks.findIndex(
                                                    (week) =>
                                                      (week._id && week._id === w._id) ||
                                                      (week.id && week.id === w.id),
                                                  );
                                                if (weekIndex !== -1) {
                                                  const workoutIndex = newWeeks[
                                                    weekIndex
                                                  ].workouts.findIndex(
                                                    (item) =>
                                                      (item._id && item._id === workout._id) ||
                                                      (item.id && item.id === workout.id),
                                                  );
                                                  if (workoutIndex !== -1) {
                                                    newWeeks[
                                                      weekIndex
                                                    ].workouts.splice(
                                                      workoutIndex,
                                                      1,
                                                    );
                                                    setWeeks(newWeeks);
                                                  }
                                                }
                                              }}
                                              style={iconStyle}
                                            />
                                            <img
                                              src={CopyIconWhite}
                                              alt="drag-drop"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                duplicateWorkout(w.id, workout);
                                              }}
                                              style={iconStyle}
                                            />
                                            <DraggableHandle>
                                              <img
                                                src={DragAndDropIconWhite}
                                                alt="drag-drop"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  // duplicateWorkout(w.id, workout);
                                                }}
                                                style={{
                                                  ...iconStyle,
                                                  cursor: "move",
                                                }}
                                              />
                                            </DraggableHandle>
                                          </div>
                                        </div>
                                      </DraggableItem>
                                    ))}
                                </DraggableArea>
                              </div>
                              <AddNewButton
                                style={{
                                  margin: "5px",
                                  backgroundColor: "#2A2F368C",
                                  padding: "5px",
                                  width: "100%",
                                }}
                                onClick={() => onAddWorkout(w._id || w.id)}
                                type="big"
                              />
                            </div>
                          </Collapse.Panel>
                        </Collapse>
                      </DraggableItem>
                    ))}
                </DraggableArea>
                <AddNewButton onClick={onAddWeek} type="big" />
              </div>
            </div>
            {/* subscription */}
            <>
              <div
                className="trainer-profile-goals-heading font-paragraph-white"
                style={{ color: "#72777B", textTransform: "uppercase" }}
              >
                <T>challengeStudio.subscription</T>
                <Tooltip placement="top" title={tooltipText}>
                  <img src={HelpIcon} alt="" style={{ marginLeft: "5px" }} />
                </Tooltip>
              </div>
              <div className="font-paragraph-white">
                <T>challengeStudio.choose_your_prices</T>
              </div>
              {isNonHeadSibling ? (
                <div
                  style={{
                    padding: "16px",
                    background: "#2a2f36",
                    borderRadius: "8px",
                    color: "#ff7700",
                    marginBottom: "16px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      marginBottom: "4px",
                    }}
                  >
                    Price is managed by the group head
                  </div>
                  {groupHeadName && (
                    <div style={{ fontSize: "12px", color: "#aaa" }}>
                      Group head: "{groupHeadName}"
                    </div>
                  )}
                </div>
              ) : null}
              <div
                className="unlock-challenge-packages"
                style={isNonHeadSibling ? { display: "none" } : {}}
              >
                <div
                  className="unlock-challenge-pack font-paragraph-white"
                  onClick={() => {
                    if (pack === "CHALLENGE_1") {
                      setPack("");
                    } else {
                      setPack("CHALLENGE_1");
                    }
                    setErrors((prev) => ({
                      ...prev,
                      pack: "",
                    }));
                  }}
                  style={{
                    border: errors.pack
                      ? "2px solid red"
                      : pack === "CHALLENGE_1"
                        ? "2px solid #f37720"
                        : "2px solid #2a2f36",
                  }}
                >
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "400",
                      marginBottom: "30px",
                    }}
                  >
                    {getPackage("CHALLENGE_1")?.displayName ||
                      "One-Time Challenge"}
                  </span>
                  <span>
                    <input
                      placeholder="€00"
                      style={{
                        width: "100%",
                        textAlign: "center",
                        margin: "0px auto",
                        height: "40px",
                        marginTop: "-5px",
                        fontSize: "20px",
                        border: errors.customPrice ? "2px solid red" : "none",
                      }}
                      prefix={"€"}
                      className="adminV2-bi-input"
                      type="number"
                      value={customPrice}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPack("CHALLENGE_1");
                        setErrors((prev) => ({
                          ...prev,
                          pack: "",
                        }));
                      }}
                      onChange={(e) => {
                        if (errors.customPrice) {
                          setErrors((prev) => ({
                            ...prev,
                            customPrice: "",
                          }));
                        }
                        setCustomPrice(`${e.target.value}`);
                      }}
                    />
                  </span>
                  <span style={{ margin: "15px 0" }}>
                    <T>challengeStudio.no_subscription</T>
                  </span>
                  <span style={{ fontSize: "14px", color: "#7e7c79" }}>
                    <T>challengeStudio.billed_once</T>
                  </span>
                </div>
                <div
                  className="unlock-challenge-pack font-paragraph-white"
                  onClick={() => {
                    if (pack === "CHALLENGE_12") {
                      setPack("");
                    } else {
                      setPack("CHALLENGE_12");
                    }
                    setErrors((prev) => ({
                      ...prev,
                      pack: "",
                    }));
                  }}
                  style={{
                    border: errors.pack
                      ? "2px solid red"
                      : pack === "CHALLENGE_12"
                        ? "2px solid #f37720"
                        : "2px solid #2a2f36",
                  }}
                >
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "400",
                      marginBottom: "10px",
                    }}
                  >
                    {getPackage("CHALLENGE_12")?.displayName ||
                      "12 Months Plan"}
                  </span>
                  {getPackage("CHALLENGE_12")?.savingsPercent && (
                    <span
                      className="font-paragraph-white"
                      style={{
                        fontSize: "13px",
                        backgroundColor: "#f37720",
                        padding: "5px",
                        width: "120px",
                        fontWeight: "600",
                        alignSelf: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <T>challengeStudio.save_up_to</T>{" "}
                      {getPackage("CHALLENGE_12")?.savingsPercent}
                    </span>
                  )}
                  <span style={{ fontSize: "26px", fontWeight: "600" }}>
                    {getPackage("CHALLENGE_12")?.priceDisplayText ||
                      `€${getPackage("CHALLENGE_12")?.price}`}
                  </span>
                  <span style={{ margin: "15px 0" }}>
                    {getPackage("CHALLENGE_12")?.billingInterval} {get(strings, "payment.months_plan", "months plan")}
                  </span>
                  <span style={{ fontSize: "14px", color: "#7e7c79" }}>
                    <T>challengeStudio.billed_monthly</T>
                  </span>
                </div>
                <div
                  className="unlock-challenge-pack font-paragraph-white"
                  onClick={() => {
                    if (pack === "CHALLENGE_3") {
                      setPack("");
                    } else {
                      setPack("CHALLENGE_3");
                    }
                    setErrors((prev) => ({
                      ...prev,
                      pack: "",
                    }));
                  }}
                  style={{
                    border: errors.pack
                      ? "2px solid red"
                      : pack === "CHALLENGE_3"
                        ? "2px solid #f37720"
                        : "2px solid #2a2f36",
                  }}
                >
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "400",
                      marginBottom: "10px",
                    }}
                  >
                    {getPackage("CHALLENGE_3")?.displayName || "3 Months Plan"}
                  </span>
                  {getPackage("CHALLENGE_3")?.savingsPercent && (
                    <span
                      className="font-paragraph-white"
                      style={{
                        fontSize: "13px",
                        backgroundColor: "#f37720",
                        padding: "5px",
                        width: "120px",
                        fontWeight: "600",
                        alignSelf: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <T>challengeStudio.save_up_to</T>{" "}
                      {getPackage("CHALLENGE_3")?.savingsPercent}
                    </span>
                  )}
                  <span style={{ fontSize: "26px", fontWeight: "600" }}>
                    {getPackage("CHALLENGE_3")?.priceDisplayText ||
                      `€${getPackage("CHALLENGE_3")?.price}`}
                  </span>
                  <span style={{ margin: "15px 0" }}>
                    {getPackage("CHALLENGE_3")?.billingInterval} {get(strings, "payment.months_plan", "months plan")}
                  </span>
                  <span style={{ fontSize: "14px", color: "#7e7c79" }}>
                    <T>challengeStudio.billed_monthly</T>
                  </span>
                </div>
              </div>
            </>

            <>
              <div>
                <Checkbox
                  checked={allowComments}
                  onChange={(e) => setAllowComments(e.target.checked)}
                  className="font-paragraph-white"
                  style={{ marginTop: "10px" }}
                >
                  <T>adminDashboard.challenges.allowcb</T>
                </Checkbox>
              </div>
              <div>
                <Checkbox
                  checked={allowReviews}
                  onChange={(e) => setAllowReviews(e.target.checked)}
                  className="font-paragraph-white"
                  style={{ marginTop: "10px" }}
                >
                  <T>adminDashboard.challenges.allowrv</T>
                </Checkbox>
              </div>
              <div>
                <Checkbox
                  checked={makePublic}
                  onChange={(e) => setMakePublic(e.target.checked)}
                  className="font-paragraph-white"
                  style={{ marginTop: "10px" }}
                >
                  <T>adminDashboard.challenges.mp</T>
                </Checkbox>
              </div>

              <div>
                <Checkbox
                  checked={userCreatePost}
                  onChange={(e) => setUserCreatePost(e.target.checked)}
                  className="font-paragraph-white"
                  style={{ marginTop: "10px" }}
                >
                  <T>challengeStudio.create_post</T>
                </Checkbox>
              </div>

              {isUpdate && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "15px",
                    backgroundColor: adminApproved ? "#1a472a" : "#4a3626",
                    border: adminApproved
                      ? "2px solid #22c55e"
                      : "2px solid #f59e0b",
                    borderRadius: "5px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <p
                      className="font-paragraph-white"
                      style={{
                        margin: 0,
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      <T>challengeStudio.admin_approval_status</T>
                    </p>
                    <p
                      style={{
                        margin: "5px 0 0 0",
                        fontSize: "12px",
                        color: "#9ca3af",
                      }}
                    >
                      <T>challengeStudio.only_admins_manage_requests</T>
                    </p>
                  </div>
                  <div
                    style={{
                      padding: "8px 16px",
                      backgroundColor: adminApproved ? "#22c55e" : "#f59e0b",
                      borderRadius: "4px",
                      fontWeight: "600",
                      fontSize: "14px",
                      color: "#fff",
                      ...(hasAnyRole(userInfo, ["admin"]) && {
                        cursor: "pointer",
                      }),
                    }}
                    {...(hasAnyRole(userInfo, ["admin"]) && {
                      onClick: () => {},
                    })}
                  >
                    {adminApproved
                      ? get(strings, "challengeStudio.approved", "Approved")
                      : get(
                          strings,
                          "challengeStudio.pending_approval",
                          "Pending Approval",
                        )}
                  </div>
                </div>
              )}
            </>

            {isUpdate && !adminApproved && (
              <Alert
                message={get(
                  strings,
                  "admin.approval_warning",
                  "This content is pending admin approval and is not visible to the public.",
                )}
                type="warning"
                showIcon
                style={{ margin: "10px" }}
              />
            )}
            <button
              style={{
                background: "#f37720",
                color: "white",
                border: "none",
                padding: "10px 20px",
                fontSize: "16px",
                cursor: "pointer",
                marginTop: "20px",
                width: "99%",
                borderRadius: "5px",
                margin: "20px 10px",
              }}
              onClick={() => {
                handleSaveChallenge();
              }}
            >
              <T>challengeStudio.save_challenge</T>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withRouter(BasicInformation);
