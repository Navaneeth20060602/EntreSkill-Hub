import businesses from "./businesses";

const businessRecommendations = {};

businesses.forEach((business) => {

    if (!businessRecommendations[business.skill]) {

        businessRecommendations[business.skill] = [];

    }

    businessRecommendations[business.skill].push({

        id: business.id,
        title: business.title,
        description: business.description,
        investment: business.investment,
        income: business.income,
        difficulty: business.difficulty,
        duration: business.duration

    });

});

export default businessRecommendations;