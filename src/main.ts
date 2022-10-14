/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import * as extension from './extension';
import type { ExtensionContext } from 'vscode';

export async function activate(context: ExtensionContext) {
    return extension.affToolkitActivate(context);
}

export async function deactivate() {
    await extension.affToolkitDeactivate();
}
