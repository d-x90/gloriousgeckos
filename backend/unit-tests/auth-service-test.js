require('./.test-variables');

const { stub } = require('sinon');
const userService = require('../src/services/user-service');
const authService = require('../src/services/auth-service');
const { expect } = require('chai');
const bcrypt = require('bcrypt');

describe('auth-service-test', () => {
    describe('login', () => {
        const usernameOrWallet = 'username';
        const password = 'password';

        it('should fail if user not found', async () => {
            // Arrange
            stub(userService, 'getUserByUsernameOrWallet').resolves(null);
            try {
                // Act
                await authService.login(usernameOrWallet, password);
            } catch (err) {
                // Assert
                expect(err).to.be.an('error');
            } finally {
                // CleanUp
                userService.getUserByUsernameOrWallet.restore();
            }
        });

        it('should fail if password is incorrect', async () => {
            // Arrange
            stub(bcrypt, 'compare').resolves(false);
            try {
                // Act
                await authService.login(usernameOrWallet, password);
            } catch (err) {
                // Assert
                expect(err).to.be.an('error');
            } finally {
                // CleanUp
                bcrypt.compare.restore();
            }
        });

        it('should return token if credentials are correct', async () => {
            // Arrange
            stub(userService, 'getUserByUsernameOrWallet').resolves({
                username: 'username',
                wallet: usernameOrWallet,
            });
            stub(bcrypt, 'compare').resolves(true);

            try {
                // Act
                const token = await authService.login(
                    usernameOrWallet,
                    password
                );
                //Assert
                expect(token).to.be.not.null;
            } finally {
                // CleanUp
                userService.getUserByUsernameOrWallet.restore();
                bcrypt.compare.restore();
            }
        });
    });
});
