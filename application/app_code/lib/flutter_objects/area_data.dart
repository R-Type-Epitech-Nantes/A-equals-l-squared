import 'package:application/flutter_objects/parameter_data.dart';
import 'package:application/flutter_objects/reaction_data.dart';
import 'package:application/pages/home/home_functional.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import 'action_data.dart';
import '../../material_lib_functions/material_functions.dart';

/// This class is the Area class.
/// It contains all information about an Area
class AreaData {
  String id;
  String name;
  String userId;
  String actionId;
  String reactionId;
  bool isEnable = true;
  String? description;
  List<ParameterContent> actionParameters;
  List<ParameterContent> reactionParameters;

  /// Constructor of the Area class
  AreaData({
    required this.id,
    required this.name,
    required this.userId,
    required this.actionId,
    required this.reactionId,
    required this.isEnable,
    required this.actionParameters,
    required this.reactionParameters,
    this.description,
  });

  /// Convert a json map into the class
  factory AreaData.fromJson(Map<String, dynamic> json) {
    List<ParameterContent> actionParameters = <ParameterContent>[];
    for (var temp in json['ActionParameters']) {
      actionParameters.add(ParameterContent.fromJson(temp));
    }
    List<ParameterContent> reactionParameters = <ParameterContent>[];
    for (var temp in json['ReactionParameters']) {
      reactionParameters.add(ParameterContent.fromJson(temp));
    }
    return AreaData(
        id: json['id'],
        name: json['name'],
        userId: json['userId'],
        actionId: json['actionId'],
        reactionId: json['reactionId'],
        isEnable: json['isEnable'],
        description: 'It\'s a description',
        actionParameters: actionParameters,
        reactionParameters: reactionParameters);
  }

  /// Get a visual representation of an Area for create page
  /// mode -> true = complete representation, false = only area preview
  Widget displayForCreate(bool mode) {
    late ActionData action;
    late ReactionData reaction;

    for (var temp in serviceDataList) {
      for (var tempAct in temp.actions) {
        if (tempAct.id == actionId) {
          action = tempAct;
          break;
        }
      }
    }
    for (var temp in serviceDataList) {
      for (var tempReact in temp.reactions) {
        if (tempReact.id == reactionId) {
          reaction = tempReact;
          break;
        }
      }
    }
    List<Widget> listDisplay = <Widget>[];
    if (mode) {
      listDisplay.add(Column(
        children: <Widget>[
          Row(children: <Widget>[
            Text(
              name,
              style: TextStyle(
                  color: isEnable ? Colors.green : Colors.red, fontSize: 20),
            ),
          ]),
          const SizedBox(
            height: 10,
          ),
          materialShadowForArea(Column(children: <Widget>[
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
              child: Column(
                children: [
                  const Text("Action"),
                  action.display(true, actionParameters),
                ],
              ),
            )
          ])),
          const SizedBox(
            height: 20,
          ),
          materialShadowForArea(Column(children: <Widget>[
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
              child: Column(
                children: [
                  const Text("Reaction"),
                  reaction.display(true, reactionParameters)
                ],
              ),
            )
          ])),
        ],
      ));
    } else {
      try {
        listDisplay.add(Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                Text(
                  name,
                  style: const TextStyle(color: Colors.black),
                ),
                const Icon(
                  Icons.ac_unit,
                  color: Colors.black,
                )

                /// change color
              ],
            ),
            const SizedBox(height: 20),
            Text(
              'Description : \n\n $description',
              style: const TextStyle(color: Colors.black),
            )

            /// Put Description when it's in DB
          ],
        ));

        ///        listDisplay.add(Text(action.name));
        ///        listDisplay.add(Text(reaction.name));
      } catch (err) {
        listDisplay.add(const Text("Please logout and login."));
      }
    }
    return Column(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: listDisplay,
    );
  }

  /// Get a visual representation of an Area
  /// mode -> true = complete representation, false = only area preview
  Widget display(bool mode) {
    late ActionData action;
    late ReactionData reaction;

    for (var temp in serviceDataList) {
      for (var tempAct in temp.actions) {
        if (tempAct.id == actionId) {
          action = tempAct;
          break;
        }
      }
    }
    for (var temp in serviceDataList) {
      for (var tempReact in temp.reactions) {
        if (tempReact.id == reactionId) {
          reaction = tempReact;
          break;
        }
      }
    }
    List<Widget> listDisplay = <Widget>[];
    if (mode) {
      listDisplay.add(Column(
        children: <Widget>[
          Row(children: <Widget>[
            Text(
              (isEnable
                  ? 'Area : $name is activated'
                  : 'Area : $name is disabled'),
              style: TextStyle(
                  color: isEnable ? Colors.green : Colors.red, fontSize: 20),
            ),
          ]),
          const SizedBox(
            height: 10,
          ),
          materialShadowForArea(Column(children: <Widget>[
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
              child: Column(
                children: [
                  const Text("Action"),
                  action.display(true, actionParameters),
                ],
              ),
            )
          ])),
          const SizedBox(
            height: 20,
          ),
          materialShadowForArea(Column(children: <Widget>[
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
              child: Column(
                children: [
                  const Text("Reaction"),
                  reaction.display(true, reactionParameters)
                ],
              ),
            )
          ])),
        ],
      ));
    } else {
      try {
        listDisplay.add(Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: <Widget>[
                Text(
                  name,
                  style: const TextStyle(color: Colors.black),
                ),
                const Icon(
                  Icons.ac_unit,
                  color: Colors.black,
                )

                /// change color
              ],
            ),
            const SizedBox(height: 20),
            Text(
              'Description : \n\n $description',
              style: const TextStyle(color: Colors.black),
            )

            /// Put Description when it's in DB
          ],
        ));

        ///        listDisplay.add(Text(action.name));
        ///        listDisplay.add(Text(reaction.name));
      } catch (err) {
        listDisplay.add(const Text("Please logout and login."));
      }
    }
    return Column(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: listDisplay,
    );
  }

  /// Function to display area name
  Widget? displayAreaName() {
    if (isEnable) {
      return Column(
        children: <Widget>[
          Text(name),
        ],
      );
    } else {
      return null;
    }
  }

  /// Function to display area description
  Widget? displayAreaDescription() {
    if (isEnable) {
      /// Add ' && description != null ' when is in DB
      return Column(
        children: const <Widget>[
          Text('This is a description'),
        ],
      );
    } else {
      return null;
    }
  }

  bool changeIfIsEnable() {
    if (isEnable) {
      return false;
    } else {
      return true;
    }
  }
}
