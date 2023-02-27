'use strict'

const client = require('../init').client
const { replaceDynamicParameters } = require('../../glue/dynamic_parameters.js')

/**
 * @brief Change the activity of the bot from an area
 * @param {*} ReactionParameters The parameters
 * @param {*} dynamicParameters Dynamic parameters
 * @returns True if the message has been sent, false otherwise
 */
function discordChangeActivityFromAreaParameters (ReactionParameters, dynamicParameters) {
  let activity = ReactionParameters.find(
    parameter => parameter.Parameter.name == 'activity'
  ).value
  activity = replaceDynamicParameters(activity, dynamicParameters)
  return changeActivity(activity)
}

/**
 * @brief Change the activity of the bot
 * @param {*} string The new activity
 * @returns True if the activity has been changed, false otherwise
 */
function changeActivity (string) {
  client.user
    .setActivity(string)
    .then(() => {
      return true
    })
    .catch(err => {
      return false
    })
}

module.exports = { discordChangeActivityFromAreaParameters, changeActivity }
