const IntensityIcon = ({ intensity, style = {} }) => {
  const chevron =
    intensity === "Easy"
      ? "›"
      : intensity === "Medium"
      ? "››"
      : intensity === "Hard"
      ? "›››"
      : "›";

  return (
    <span
      style={{
        fontWeight: "bold",
        ...style,
      }}
    >
      {chevron}
    </span>
  );
};

export default IntensityIcon;
