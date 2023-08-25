import Joi from 'joi';

export const receitaSchema = Joi.object({
    titulo: Joi.string().required(),
    ingredientes: Joi.string().required().min(10),
    preparo: Joi.string().required(),
})
