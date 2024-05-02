import { beforeAll, describe, expect, test } from "vitest";
import { EmptyFileSystem, type LangiumDocument } from "langium";
import { expandToString as s } from "langium/generate";
import { parseHelper } from "langium/test";
import { createContextMapServices } from "../../src/language/context-map-module.js";
import { Link, ContextMapModel as Model, Node, isContextMapModel as isModel} from "../../src/language/generated/ast.js";

let services: ReturnType<typeof createContextMapServices>;
let parse:    ReturnType<typeof parseHelper<Model>>;
let document: LangiumDocument<Model> | undefined;

beforeAll(async () => {
    services = createContextMapServices(EmptyFileSystem);
    parse = parseHelper<Model>(services.ContextMap);

    // activate the following if your linking test requires elements from a built-in library, for example
    // await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});

describe('Parsing tests', () => {

    test('parse simple model', async () => {
        document = await parse(`
/* Example Context Map written with 'ContextMapper DSL' */
        ContextMap InsuranceContextMap {
            
            /* Add bounded contexts to this context map: */
            contains CustomerManagementContext
            contains CustomerSelfServiceContext
            contains PrintingContext
            contains PolicyManagementContext
            contains RiskManagementContext
            contains DebtCollection
            
            /* Define the context relationships: */ 
        
            CustomerSelfServiceContext [D,C]<-[U,S] CustomerManagementContext
            
            CustomerManagementContext [D,ACL]<-[U,OHS,PL] PrintingContext
            
            PrintingContext [U,OHS,PL]->[D,ACL] PolicyManagementContext
            
            RiskManagementContext [P]<->[P] PolicyManagementContext
        
            PolicyManagementContext [D,CF]<-[U,OHS,PL] CustomerManagementContext
        
            DebtCollection [D,ACL]<-[U,OHS,PL] PrintingContext
        
            PolicyManagementContext [SK]<->[SK] DebtCollection	
        }
        
        `);

        // check for absensce of parser errors the classic way:
        //  deacivated, find a much more human readable way below!
        expect(document.parseResult.parserErrors).toHaveLength(0);

        expect(
            // here we use a (tagged) template expression to create a human readable representation
            //  of the AST part we are interested in and that is to be compared to our expectation;
            // prior to the tagged template expression we check for validity of the parsed document object
            //  by means of the reusable function 'checkDocumentValid()' to sort out (critical) typos first;
            checkDocumentValid(document) || s`
        Body:
          name: ${document.parseResult.value?.name}
          Nodes: 
            ${document.parseResult.value?.body?.filter(n=>n.$type === "Node").map(rawNode => {
            return s`
            Node:
              name: ${(rawNode as Node).name}
            `;
            })?.join('\n')}
          Edges: 
            ${document.parseResult.value?.body?.filter(n=>n.$type === "Link").map(rawLink => { 
                const link = rawLink as Link;
                return s`
                Edge:
                  directon: ${link.direction}
                  LeftNode: 
                    name: ${link.leftNode.ref?.name}
                    labels: ${link.leftLabelBox?.labels.join(",")}
                  RightNode: 
                    name: ${link.rightNode.ref?.name}
                    labels: ${link.leftLabelBox?.labels.join(",")}
                `
            })?.join('\n')}
        `
        ).toBe(s`
        Body:
          name: InsuranceContextMap
          Nodes:
            Node:
              name: CustomerManagementContext
            Node:
              name: CustomerSelfServiceContext
            Node:
              name: PrintingContext
            Node:
              name: PolicyManagementContext
            Node:
              name: RiskManagementContext
            Node:
              name: DebtCollection
          Edges: 
            Edge:
              directon: <-
              LeftNode:
                name: CustomerSelfServiceContext
                labels: D,C
              RightNode:
                name: CustomerManagementContext
                labels: D,C
            Edge:
              directon: <-
              LeftNode:
                name: CustomerManagementContext
                labels: D,ACL
              RightNode:
                name: PrintingContext
                labels: D,ACL
            Edge:
              directon: ->
              LeftNode:
                name: PrintingContext
                labels: U,OHS,PL
              RightNode:
                name: PolicyManagementContext
                labels: U,OHS,PL
            Edge:
              directon: <->
              LeftNode:
                name: RiskManagementContext
                labels: P
              RightNode:
                name: PolicyManagementContext
                labels: P
            Edge:
              directon: <-
              LeftNode:
                name: PolicyManagementContext
                labels: D,CF
              RightNode:
                name: CustomerManagementContext
                labels: D,CF
            Edge:
              directon: <-
              LeftNode:
                name: DebtCollection
                labels: D,ACL
              RightNode:
                name: PrintingContext
                labels: D,ACL
            Edge:
              directon: <->
              LeftNode:
                name: PolicyManagementContext
                labels: SK
              RightNode:
                name: DebtCollection
                labels: SK
        `);
    });
});

function checkDocumentValid(document: LangiumDocument): string | undefined {
    return document.parseResult.parserErrors.length && s`
        Parser errors:
          ${document.parseResult.parserErrors.map(e => e.message).join('\n  ')}
    `
        || document.parseResult.value === undefined && `ParseResult is 'undefined'.`
        || !isModel(document.parseResult.value) && `Root AST object is a ${document.parseResult.value.$type}, expected a '${Model}'.`
        || undefined;
}
