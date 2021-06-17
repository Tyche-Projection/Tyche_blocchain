const Blockchain = require('./blockchain');
const Block = require('./block');

describe('Blockchain', () => {
    let blockchain;
    let newChain;
    let originalChain;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();

        originalChain = blockchain.chain;
    });

    it('contains a `chain` array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with the genesis block as the first block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block to the chain', () => {
        const newData = 'dummy_data';
        blockchain.addBlock({ data: newData });

        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData);
    });

    describe('isValidChain()', () => {
        describe('chain does not starts with genesis block', () => {
            it('returns false', () => {
                blockchain.chain[0] = { data: 'fake_genesis' };

                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('starts with genesis block and has multiple blocks', () => {
            beforeEach(() => {
                blockchain.addBlock({ data: 'Tehran' });
                blockchain.addBlock({ data: 'Alborz' });
                blockchain.addBlock({ data: 'Zanjan' });
            });
            describe('and a lastHash refrence has changed', () => {
                it('returns false', () => {
                    blockchain.chain[2].lastHash = 'broken-lastHash';
                    
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('the chain contains a block with an invalid field', () => {
                it('returns false', () => {
                    blockchain.chain[2].data = 'bad-data';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('the chain deos not contain any invalid blocks', () => {
                it('returns true', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });
        });

        describe('replaceChain()', () => {
            let errorMock;
            let logMoch;

            beforeEach(() => {
                errorMock = jest.fn();
                logMoch = jest.fn();

                global.console.error = errorMock;
                global.console.log = logMoch;
            });

            describe('the new chain is not longer', () => {
                beforeEach(() => {
                    newChain.chain[0] = { new: 'chain' };

                    blockchain.replaceChain(newChain.chain);
                });

                it('does not replace the chain', () => {
                    expect(blockchain.chain).toEqual(originalChain);
                });

                it('logs an error', () => {
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('when the new chain is longer', () => {
                beforeEach(() => {
                    newChain.addBlock({ data: 'Tehran' });
                    newChain.addBlock({ data: 'Alborz' });
                    newChain.addBlock({ data: 'Zanjan' });
                });
                describe('and the chain is not valid', () => {
                    beforeEach(() => {
                        newChain.chain[2].hash = 'broken-hash';

                        blockchain.replaceChain(newChain.chain);
                    });

                    it('does not replace the chain', () => {
                        expect(blockchain.chain).toEqual(originalChain);
                    });

                    it('logs an error', () => {
                        expect(errorMock).toHaveBeenCalled();
                    });
                });

                describe('and the chain is valid', () => {
                    beforeEach(() => {
                        blockchain.replaceChain(newChain.chain);
                    });
                    it('replace the chain', () => {
                        expect(blockchain.chain).toEqual(newChain.chain);
                    });

                    it('logs about the chain replacement', () => {
                        expect(logMoch).toHaveBeenCalled();
                    });
                });
            });
        });
        
    });
});