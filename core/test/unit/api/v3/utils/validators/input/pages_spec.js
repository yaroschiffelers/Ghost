const _ = require('lodash');
const should = require('should');
const sinon = require('sinon');
const Promise = require('bluebird');
const common = require('../../../../../../../server/lib/common');
const validators = require('../../../../../../../server/api/canary/utils/validators');

describe('Unit: v3/utils/validators/input/pages', function () {
    afterEach(function () {
        sinon.restore();
    });

    describe('add', function () {
        const apiConfig = {
            docName: 'pages'
        };

        describe('required fields', function () {
            it('should fail with no data', function () {
                const frame = {
                    options: {},
                    data: {}
                };

                return validators.input.pages.add(apiConfig, frame)
                    .then(Promise.reject)
                    .catch((err) => {
                        (err instanceof common.errors.ValidationError).should.be.true();
                    });
            });

            it('should fail with no pages', function () {
                const frame = {
                    options: {},
                    data: {
                        tags: []
                    }
                };

                return validators.input.pages.add(apiConfig, frame)
                    .then(Promise.reject)
                    .catch((err) => {
                        (err instanceof common.errors.ValidationError).should.be.true();
                    });
            });

            it('should fail with no pages in array', function () {
                const frame = {
                    options: {},
                    data: {
                        pages: []
                    }
                };

                return validators.input.pages.add(apiConfig, frame)
                    .then(Promise.reject)
                    .catch((err) => {
                        (err instanceof common.errors.ValidationError).should.be.true();
                    });
            });

            it('should fail with more than page', function () {
                const frame = {
                    options: {},
                    data: {
                        pages: [],
                        tags: []
                    }
                };

                return validators.input.pages.add(apiConfig, frame)
                    .then(Promise.reject)
                    .catch((err) => {
                        (err instanceof common.errors.ValidationError).should.be.true();
                    });
            });

            it('should fail without required fields', function () {
                const frame = {
                    options: {},
                    data: {
                        pages: [{
                            what: 'a fail'
                        }]
                    }
                };

                return validators.input.pages.add(apiConfig, frame)
                    .then(Promise.reject)
                    .catch((err) => {
                        (err instanceof common.errors.ValidationError).should.be.true();
                    });
            });

            it('should pass with required fields', function () {
                const frame = {
                    options: {},
                    data: {
                        pages: [{
                            title: 'pass',
                            authors: [{id: 'correct'}]
                        }]
                    }
                };

                return validators.input.pages.add(apiConfig, frame);
            });

            it('should remove `strip`able fields and leave regular fields', function () {
                const frame = {
                    options: {},
                    data: {
                        pages: [{
                            title: 'pass',
                            authors: [{id: 'correct'}],
                            id: 'strip me',
                            created_at: 'strip me',
                            created_by: 'strip me',
                            updated_by: 'strip me',
                            published_by: 'strip me'
                        }]
                    }
                };

                let result = validators.input.pages.add(apiConfig, frame);

                should.exist(frame.data.pages[0].title);
                should.exist(frame.data.pages[0].authors);
                should.not.exist(frame.data.pages[0].id);
                should.not.exist(frame.data.pages[0].created_at);
                should.not.exist(frame.data.pages[0].created_by);
                should.not.exist(frame.data.pages[0].updated_by);
                should.not.exist(frame.data.pages[0].published_by);

                return result;
            });
        });

        describe('field formats', function () {
            const fieldMap = {
                title: [123, new Date(), _.repeat('a', 2001)],
                slug: [123, new Date(), _.repeat('a', 192)],
                mobiledoc: [123, new Date()],
                feature_image: [123, new Date(), 'random words'],
                featured: [123, new Date(), 'abc'],
                status: [123, new Date(), 'abc'],
                locale: [123, new Date(), _.repeat('a', 7)],
                visibility: [123, new Date(), 'abc'],
                meta_title: [123, new Date(), _.repeat('a', 301)],
                meta_description: [123, new Date(), _.repeat('a', 501)]
            };

            Object.keys(fieldMap).forEach((key) => {
                it(`should fail for bad ${key}`, function () {
                    const badValues = fieldMap[key];

                    const checks = badValues.map((value) => {
                        const page = {};
                        page[key] = value;

                        if (key !== 'title') {
                            page.title = 'abc';
                        }

                        const frame = {
                            options: {},
                            data: {
                                pages: [page]
                            }
                        };

                        return validators.input.pages.add(apiConfig, frame)
                            .then(Promise.reject)
                            .catch((err) => {
                                (err instanceof common.errors.ValidationError).should.be.true();
                            });
                    });

                    return Promise.all(checks);
                });
            });
        });

        describe('authors structure', function () {
            it('should require properties', function () {
                const frame = {
                    options: {},
                    data: {
                        pages: [
                            {
                                title: 'cool',
                                authors: {}
                            }
                        ]
                    }
                };

                return validators.input.pages.add(apiConfig, frame)
                    .then(Promise.reject)
                    .catch((err) => {
                        (err instanceof common.errors.ValidationError).should.be.true();
                    });
            });

            it('should require id', function () {
                const frame = {
                    options: {},
                    data: {
                        pages: [
                            {
                                title: 'cool',
                                authors: [{
                                    name: 'hey'
                                }]
                            }
                        ]
                    }
                };

                return validators.input.pages.add(apiConfig, frame)
                    .then(Promise.reject)
                    .catch((err) => {
                        (err instanceof common.errors.ValidationError).should.be.true();
                    });
            });

            it('should pass', function () {
                const frame = {
                    options: {},
                    data: {
                        pages: [
                            {
                                title: 'cool',
                                authors: [{
                                    id: 'correct',
                                    name: 'ja'
                                }]
                            }
                        ]
                    }
                };

                return validators.input.pages.add(apiConfig, frame);
            });
        });
    });

    describe('edit', function () {
        const apiConfig = {
            docName: 'pages'
        };

        describe('required fields', function () {
            it('should fail with no data', function () {
                const frame = {
                    options: {},
                    data: {}
                };

                return validators.input.pages.edit(apiConfig, frame)
                    .then(Promise.reject)
                    .catch((err) => {
                        (err instanceof common.errors.ValidationError).should.be.true();
                    });
            });

            it('should fail with no pages', function () {
                const frame = {
                    options: {},
                    data: {
                        tags: []
                    }
                };

                return validators.input.pages.edit(apiConfig, frame)
                    .then(Promise.reject)
                    .catch((err) => {
                        (err instanceof common.errors.ValidationError).should.be.true();
                    });
            });

            it('should fail with more than page', function () {
                const frame = {
                    options: {},
                    data: {
                        pages: [],
                        tags: []
                    }
                };

                return validators.input.pages.edit(apiConfig, frame)
                    .then(Promise.reject)
                    .catch((err) => {
                        (err instanceof common.errors.ValidationError).should.be.true();
                    });
            });

            it('should pass with some fields', function () {
                const frame = {
                    options: {},
                    data: {
                        pages: [{
                            title: 'pass',
                            updated_at: new Date().toISOString()
                        }]
                    }
                };

                return validators.input.pages.edit(apiConfig, frame);
            });
        });

        describe('authors structure', function () {
            it('should require properties', function () {
                const frame = {
                    options: {},
                    data: {
                        pages: [
                            {
                                title: 'cool',
                                authors: {}
                            }
                        ]
                    }
                };

                return validators.input.pages.edit(apiConfig, frame)
                    .then(Promise.reject)
                    .catch((err) => {
                        (err instanceof common.errors.ValidationError).should.be.true();
                    });
            });

            it('should require id', function () {
                const frame = {
                    options: {},
                    data: {
                        pages: [
                            {
                                title: 'cool',
                                authors: [{
                                    name: 'hey'
                                }]
                            }
                        ]
                    }
                };

                return validators.input.pages.edit(apiConfig, frame)
                    .then(Promise.reject)
                    .catch((err) => {
                        (err instanceof common.errors.ValidationError).should.be.true();
                    });
            });

            it('should pass with valid authors', function () {
                const frame = {
                    options: {},
                    data: {
                        pages: [
                            {
                                title: 'cool',
                                updated_at: new Date().toISOString(),
                                authors: [{
                                    id: 'correct',
                                    name: 'ja'
                                }]
                            }
                        ]
                    }
                };

                return validators.input.pages.edit(apiConfig, frame);
            });

            it('should pass without authors', function () {
                const frame = {
                    options: {},
                    data: {
                        pages: [
                            {
                                title: 'cool',
                                updated_at: new Date().toISOString()
                            }
                        ]
                    }
                };

                return validators.input.pages.edit(apiConfig, frame);
            });

            it('should pass with authors as array with strings', function () {
                const frame = {
                    options: {},
                    data: {
                        pages: [
                            {
                                authors: ['email1', 'email2'],
                                updated_at: new Date().toISOString()
                            }
                        ]
                    }
                };

                return validators.input.pages.edit(apiConfig, frame);
            });

            it('should pass with authors as array with strings & objects', function () {
                const frame = {
                    options: {},
                    data: {
                        pages: [
                            {
                                authors: ['email1', {email: 'email'}],
                                updated_at: new Date().toISOString()
                            }
                        ]
                    }
                };

                return validators.input.pages.edit(apiConfig, frame);
            });
        });
    });
});
