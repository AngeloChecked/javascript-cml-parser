grammar ContextMap
import "./mermaid/common";

entry ContextMap:
    NEWLINE*
    "context-map-beta" NEWLINE*
    ContextMapBlock;

ContextMapBlock: 'ContextMap' name=ID '{' body+=(ContextMapNode | ContextMapLink)* '}';
ContextMapNode: 'contains' name=ID;
Label returns string: 'D' | 'U' | 'CF' | 'ACL' | 'OHS'| 'PL' | 'SK' | 'C' | 'S' | 'P';
LabelBox: '[' labels+=Label ((',' labels+=Label)?)* ']';
Arrow returns string: '->' | '<-' | '<->';
ContextMapLink: leftNode=[ContextMapNode:ID] leftLabelBox=(LabelBox)? direction=Arrow rightLabelBox=(LabelBox)? rightNode=[ContextMapNode:ID];
terminal ID returns string:     /[_a-zA-Z][\w_]*/;
hidden terminal ML_COMMENT:     /\/\*[\s\S]*?\*\//;
hidden terminal WS:             /\s+/;
