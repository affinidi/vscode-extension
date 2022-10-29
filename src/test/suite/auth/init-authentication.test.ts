import { authentication, commands, window } from "vscode";
import { expect } from "chai";
import { AUTH_PROVIDER_ID } from "../../../auth/authentication-provider/affinidi-authentication-provider";
import { ext } from "../../../extensionVariables";
import { sandbox } from "../setup";
import { userManagementClient } from "../../../auth/authentication-provider/user-management.client";
import { generateSession } from "../helpers";

describe("initAuthentication()", () => {
  beforeEach(() => {
    sandbox.stub(ext.outputChannel, 'appendLine');
    sandbox.stub(window, "showInformationMessage");
  });

  describe("#affinidi.signup", () => {
    it("should signup", async () => {
      sandbox.stub(authentication, "getSession");

      sandbox.stub(window, "showWarningMessage")
        .resolves('Accept' as any);

      await commands.executeCommand("affinidi.signup");

      expect(authentication.getSession).calledWith(AUTH_PROVIDER_ID, ['signup'], {
        forceNewSession: true,
      });
    });

    it("should fail signup", async () => {
      sandbox.stub(authentication, "getSession");

      sandbox.stub(window, "showWarningMessage")
        .resolves('Reject' as any);

      await commands.executeCommand("affinidi.signup");

      expect(authentication.getSession).not.called;
    });
  });

  describe("#affinidi.login", () => {
    it("should login", async () => {
      sandbox.stub(authentication, "getSession");

      await commands.executeCommand("affinidi.login");

      expect(authentication.getSession).calledWith(AUTH_PROVIDER_ID, ['login'], {
        forceNewSession: true,
      });
    });
  });

  describe("#affinidi.logout", () => {
    let getSessionStub: sinon.SinonStub;

    beforeEach(() => {
      getSessionStub = sandbox.stub(authentication, "getSession");
      sandbox.stub(ext.authProvider, "removeSession");
    });

    it("should log out when session is present", async () => {
      const sessionId = "fake-session-id";
      getSessionStub.resolves(generateSession({ id: sessionId }));

      await commands.executeCommand("affinidi.logout");

      expect(authentication.getSession).calledWith(AUTH_PROVIDER_ID, [], {
        createIfNone: false,
      });

      expect(ext.authProvider.removeSession).calledWith(sessionId);
    });

    it("should ignore when no session", async () => {
      await commands.executeCommand("affinidi.logout");

      expect(ext.authProvider.removeSession).not.called;
    });
  });

  describe("#affinidi.me", () => {
    it("should get user details", async () => {
      const userId = "fake-user-id";
      const username = "fake-username";

      sandbox
        .stub(userManagementClient, "getUserDetails")
        .resolves({ userId, username });

      await commands.executeCommand("affinidi.me");

      expect(ext.outputChannel.appendLine).calledWith(
        JSON.stringify({ userId, username })
      );
    });
  });
});
