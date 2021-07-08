## Default ui elements

The default ui elements used are Polymer paper elements. You can pass any of the properties used by the elements in the json schema for the form
## Text input
A single-line text field using [<paper-input>](https://www.webcomponents.org/element/@polymer/paper-input) component
```
		  "min":{
			"label":"Min size",
			"id":"min",
			"type":"string",
			"format":"number",
			"value":"",
			"minimum":1,
			"autoValidate":true,
			"helpText":"A minimum of 1 is required"
		  },
```

## Dropdown
A select element using [<paper-dropdown-menu>](https://www.webcomponents.org/element/@polymer/paper-dropdown-menu/elements/paper-dropdown-menu)

```
		  "default":{
			"label":"Default",
			"id":"default_action",
			"type":"string",
			"format":"dropdown",
			"x-mist-enum":"getDefaultActions"
		  }
```
You can pass static data to the element's `enum` property or pass the name of a function to the `x-mist-enum` property to load data dynamically

## Checkbox

A checkbox using [<paper-checkbox>](https://www.webcomponents.org/element/@polymer/paper-checkbox/elements/paper-checkbox)
```
		  "show":{
			"label":"Show",
			"name":"show",
			"id":"show",
			"checked":true,
			"type":"boolean",
			"noLabelFloat":true
		  }
```

## Checkbox group

```
		  "available":{
			"label":"Available actions",
			"id":"available",
			"type":"string",
			"format":"checkboxGroup",
			"enum":[
			  "destroy",
			  "stop",
			  "undefine"
			]
		  },
```

## Radio group

```
    "protocol": {
      "id": "protocol",
      "type": "string",
      "helpText": "Please choose the VPN tunnel's underlying protocol. This option may seem useful in case of security restrictions, such as protocol-specific, blocking firewall rules",
      "format": "radioGroup",
      "enum": ["TCP", "UDP"]
    }
```

## TextArea

```
		  "msg":{
			"label":"Message",
			"id": "message",
			"type": "string",
			"format":"textArea"
		  }
```
## DurationField

```
		  "default":{
			"name":"default",
			"id": "default",
			"label":"Default",
			"type": "string",
			"format":"durationField"
		  },
```

## Multirow

```
		"field":{
			"name":"field",
			"label":"Field",
			"id":"field",
			"type": "object",
			"format":"multiRow",
			"properties":{
			  "subform":{
				"$ref":"#/definitions/fieldElementSubform"
			  }
			}
		  }
```
## Subform

```
	  "costConstraintContainer":{
		"name":"cost",
		"label":"Cost constraints",
		"id":"cost_constraint_container",
		"type":"object",
		"format":"subformContainer",
		"hasToggle":true,
		"properties":{
		  "subform":{
			"$ref":"#/definitions/costConstraints"
		  }
		}
	  },
```

```
	  "costConstraints":{
		"id":"cost_constraints",
		"type":"object",
		"format":"subform",
		"properties":{
		  "max_team_run_rate":{
			"label":"Max run rate for your team",
			"name":"max_team_run_rate",
			"id":"cost_max_team_run_rate",
			"type":"string",
			"format":"number",
			"value":1,
			"minimum":1,
			"autoValidate":true,
			"helpText":"A minimum of 1 $ is required.",
			"suffix":"$"
		  },
		  "max_total_run_rate":{
			"label":"Max run rate for your entire organization",
			"name":"max_total_run_rate",
			"id":"cost_max_total_run_rate",
			"type":"string",
			"format":"number",
			"value":1,
			"minimum":1,
			"autoValidate":true,
			"helpText":"A minimum of 1 $ is required.",
			"suffix":"$"
		  }
		}
	  },
```