import { afterEach, beforeAll, describe, expect, test } from "vitest";
import { EmptyFileSystem, type LangiumDocument } from "langium";
import { expandToString as s } from "langium/generate";
import { clearDocuments, parseHelper } from "langium/test";
import { createContextMapServices } from "../../src/language/context-map-module.js";
import { ContextMap as Model, isContextMap as isModel} from "../../src/language/generated/ast.js";

let services: ReturnType<typeof createContextMapServices>;
let parse:    ReturnType<typeof parseHelper<Model>>;
let document: LangiumDocument<Model> | undefined;

beforeAll(async () => {
    services = createContextMapServices(EmptyFileSystem);
    parse = parseHelper<Model>(services.ContextMap);

    // activate the following if your linking test requires elements from a built-in library, for example
    // await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});

afterEach(async () => {
    document && clearDocuments(services.shared, [ document ]);
});

describe('Linking tests', () => {

    test('linking of greetings', async () => {
        document = await parse(`
            context-map-beta
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

        expect(
            // here we first check for validity of the parsed document object by means of the reusable function
            //  'checkDocumentValid()' to sort out (critical) typos first,
            // and then evaluate the cross references we're interested in by checking
            //  the referenced AST element as well as for a potential error message;
            checkDocumentValid(document)
                || document.parseResult.value.name
        ).toBe(s`
           InsuranceContextMap 
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
