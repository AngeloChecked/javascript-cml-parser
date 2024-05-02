grammar ContextMap

entry ContextMapModel:
    Block;

Block: 'ContextMap' name=ID '{' body+=(Node | Link)* '}';
Node: 'contains' name=ID;
Label returns string: 'D' | 'U' | 'CF' | 'ACL' | 'OHS'| 'PL' | 'SK' | 'C' | 'S' | 'P';
LabelBox: '[' labels+=Label ((',' labels+=Label)?)* ']';
Arrow returns string: '->' | '<-' | '<->';
Link: leftNode=[Node:ID] leftLabelBox=(LabelBox)? direction=Arrow rightLabelBox=(LabelBox)? rightNode=[Node:ID]; 
terminal ID returns string:     /[_a-zA-Z][\w_]*/;
hidden terminal ML_COMMENT:     /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT:     /\/\/[^\n\r]*/;
hidden terminal WS:             /\s+/;