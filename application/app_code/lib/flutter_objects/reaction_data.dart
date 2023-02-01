import 'package:application/flutter_objects/parameter_data.dart';

/// This class is the reaction class.
/// It contains all information about a reaction
class ReactionData {
  String id;
  String name;
  String description;
  DateTime createdAt;
  bool isEnable;
  String serviceId;
  List<ParameterData> parameters;

  /// Constructor of the reaction class
  ReactionData({
    required this.id,
    required this.name,
    required this.description,
    required this.createdAt,
    required this.isEnable,
    required this.serviceId,
    required this.parameters,
  });

  /// Convert a json map into the class
  factory ReactionData.fromJson(Map<String, dynamic> json) {
    List<ParameterData> parameters = <ParameterData>[];
    for (var temp in json['Parameters']) {
      parameters.add(ParameterData.fromJson(temp));
    }
    return ReactionData(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      createdAt: DateTime.parse(json['createdAt']),
      isEnable: json['isEnable'],
      serviceId: json['serviceId'],
      parameters: parameters,
    );
  }
}
