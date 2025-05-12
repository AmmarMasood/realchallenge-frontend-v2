import get from "lodash/get";
import { useContext } from "react";
import { LanguageContext } from "../contexts/LanguageContext";

export const T = (props) => {
  const children = props.children ? props.children : props;
  const { strings } = useContext(LanguageContext);

  return get(strings, children, children);
};
