using Amazon;
using Amazon.KeyManagementService;
using Amazon.KeyManagementService.Model;
using Amazon.Runtime;
using System;
using System.IO;
using System.Text;
using System.Configuration;

public class AwsConnection
{
    private AmazonKeyManagementServiceClient client;
    private string kmsArn;

    public AwsConnection()
    {
        var region = "us-east-2";
        var accessKey = "AKIAUOM3A7ILZQZFRKPH";
        var secretKey = "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";
        this.kmsArn = "arn:aws:kms:us-east-2:305804671511:key/51c6db1b-b491-4388-a77c-0f69a8be4232";

        var awsCredentials = new BasicAWSCredentials(accessKey, secretKey);
        this.client = new AmazonKeyManagementServiceClient(awsCredentials, RegionEndpoint.GetBySystemName(region));
    }

    public AmazonKeyManagementServiceClient GetClient()
    {
        return this.client;
    }

    public string Encrypt(string data)
    {
        var request = new EncryptRequest
        {
            KeyId = this.kmsArn,
            Plaintext = new MemoryStream(Encoding.UTF8.GetBytes(data))
        };

        var response = this.client.EncryptAsync(request).Result;
        string encMail = Convert.ToBase64String(response.CiphertextBlob.ToArray());
        Console.WriteLine(encMail);
        return encMail;
    }

    public string Decrypt(string encryptedData)
    {
        var decodedData = Convert.FromBase64String(encryptedData);
        var request = new DecryptRequest
        {
            CiphertextBlob = new MemoryStream(decodedData)
        };

        var response = this.client.DecryptAsync(request).Result;
        return Encoding.UTF8.GetString(response.Plaintext.ToArray());
    }
}
