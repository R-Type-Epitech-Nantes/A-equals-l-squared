import 'package:application/flutter_objects/parameter_data.dart';
import 'package:flutter/material.dart';

/// This class is the action class.
/// It contains all information about an action
class ActionData {
  String id;
  String name;
  String description;
  DateTime createdAt;
  bool isEnable;
  String serviceId;
  List<ParameterData> parameters;

  /// Constructor of the action class
  ActionData(
      {required this.id,
      required this.name,
      required this.description,
      required this.createdAt,
      required this.isEnable,
      required this.serviceId,
      required this.parameters});

  /// Convert a json map into the class
  factory ActionData.fromJson(Map<String, dynamic> json) {
    List<ParameterData> parameters = <ParameterData>[];
    for (var temp in json['Parameters']) {
      parameters.add(ParameterData.fromJson(temp));
    }
    return ActionData(
        id: json['id'],
        name: json['name'],
        description: json['description'],
        createdAt: DateTime.parse(json['createdAt']),
        isEnable: json['isEnable'],
        serviceId: json['serviceId'],
        parameters: parameters);
  }

  /// Return the list of all the associated param content
  List<ParameterContent> getAllParameterContent() {
    List<ParameterContent> paramList = <ParameterContent>[];

    for (var temp in parameters) {
      if (temp.matchedContent == null) {
        paramList.add(ParameterContent(paramId: temp.id, value: ""));
      } else {
        paramList.add(temp.matchedContent!);
      }
    }

    return paramList;
  }

  /// Get a visual representation of an Action
  /// mode -> true = params, false = only name and desc
  Widget display(bool mode) {
    List<Widget> paramWid = <Widget>[];
    paramWid.add(
      Text(
        name,
        style: TextStyle(color: isEnable ? Colors.green : Colors.red),
      ),
    );
    paramWid.add(
      Text(description),
    );
    if (mode == true) {
      for (var temp in parameters) {
        paramWid.add(temp.display());
      }
    }
    return Column(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: paramWid,
    );
  }
}
