import { Tree } from '@angular-devkit/schematics';
import { UnitTestTree } from '@angular-devkit/schematics/testing';
import { updateWorkspaceInTree } from '@nrwl/workspace';
import { createEmptyWorkspace } from '@nrwl/workspace/testing';
import { callRule } from '../../../utils/testing';
import { Schema } from '../schema';
import { updateWorkspace } from './update-workspace';

describe('updateWorkspace Rule', () => {
  let tree: UnitTestTree;
  let schema: Schema;

  beforeEach(async () => {
    tree = new UnitTestTree(Tree.empty());
    tree = createEmptyWorkspace(tree) as UnitTestTree;

    schema = {
      projectName: 'ng-app'
    };

    tree = (await callRule(
      updateWorkspaceInTree(workspace => {
        return {
          version: 1,
          projects: {
            'ng-app': {
              projectType: 'application',
              schematics: {},
              root: 'apps/ng-app',
              sourceRoot: 'apps/ng-app/src',
              prefix: 'happyorg',
              architect: {
                build: {
                  builder: '@angular-devkit/build-angular:browser',
                  options: {}
                }
              }
            },
            'ng-app-e2e': {
              root: 'apps/ng-app-e2e',
              sourceRoot: 'apps/ng-app-e2e/src',
              projectType: 'application',
              architect: {
                e2e: {
                  builder: '@nrwl/cypress:cypress',
                  options: {
                    cypressConfig: 'apps/ng-app-e2e/cypress.json',
                    tsConfig: 'apps/ng-app-e2e/tsconfig.e2e.json',
                    devServerTarget: 'ng-app:serve'
                  }
                }
              }
            }
          }
        };
      }),
      tree
    )) as UnitTestTree;
  });

  it('should delete the project', async () => {
    let workspace = JSON.parse(tree.read('workspace.json').toString());
    expect(workspace.projects['ng-app']).toBeDefined();

    tree = (await callRule(updateWorkspace(schema), tree)) as UnitTestTree;

    workspace = JSON.parse(tree.read('workspace.json').toString());
    expect(workspace.projects['ng-app']).toBeUndefined();
  });
});
