import businesses from "../data/businesses";

export function getBusinessesForSkill(skill) {
  return businesses.filter((b) => b.skill === skill);
}

export function getBusinessByTitle(title) {
  return businesses.find((b) => b.title === title);
}

export default businesses;
