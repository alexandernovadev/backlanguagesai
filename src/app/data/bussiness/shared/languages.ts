const languagesJson = [
  { value: "es", label: "Español" },
  { value: "en", label: "Inglés" },
  { value: "pt", label: "Portugués" },
];

const languagesList = languagesJson.map((language) => language.value);

export { languagesJson, languagesList };
