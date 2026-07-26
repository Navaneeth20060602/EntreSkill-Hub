import businesses from "./businesses";

const roadmaps = {};

businesses.forEach((business) => {

    roadmaps[business.title] = business.roadmap;

});

export default roadmaps;