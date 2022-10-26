import { expect } from "chai";
import * as sinon from "sinon";
import { sandbox } from "../../setup";
import { window } from "vscode";
import { executeLoginProcess } from "../../../../auth/authentication-provider/login-process";
import { generateConsoleAuthCookie } from '../../helpers';
import { userManagementClient } from '../../../../auth/authentication-provider/user-management.client';

describe("executeLoginProcess()", () => {
  const userId = "fake-user-id";
  const username = "fake-username";
  const email = "fake@example.com";
  const loginToken = "fake-login-token";
  const confirmationCode = "fake-confirmation-code";
  const cookie = generateConsoleAuthCookie({ userId, username });

  let showInputBoxStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox.stub(userManagementClient, 'login').resolves({ token: loginToken });
    sandbox.stub(userManagementClient, 'loginConfirm').resolves({ cookie });

    sandbox.stub(window, "showInformationMessage");
    showInputBoxStub = sandbox
      .stub(window, "showInputBox")
      .onFirstCall()
      .resolves(email)
      .onSecondCall()
      .resolves(confirmationCode);
  });

  it("should execute a login flow", async () => {
    expect(await executeLoginProcess()).to.deep.eq({
      email,
      id: userId,
      accessToken: cookie,
    });

    expect(userManagementClient.login).calledWith({ username: email });
    expect(userManagementClient.loginConfirm).calledWith({ confirmationCode, token: loginToken });
  });

  it("should fail when email is not provided", async () => {
    showInputBoxStub.onFirstCall().resolves(undefined);

    expect(executeLoginProcess()).to.rejectedWith("Email is required");
  });

  it("should fail when confirmation code is not provided", async () => {
    showInputBoxStub.onSecondCall().resolves(undefined);

    expect(executeLoginProcess()).to.rejectedWith(
      "Confirmation code is required"
    );
  });
});
